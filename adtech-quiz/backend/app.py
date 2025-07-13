import json
import os
import random
import time
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
questions_table = dynamodb.Table(os.environ.get('QUESTIONS_TABLE_NAME', 'adtech_questions'))
leaderboard_table = dynamodb.Table(os.environ.get('LEADERBOARD_TABLE_NAME', 'leaderboard'))

def get_question_handler(event, context):
    try:
        # Get all question IDs
        response = questions_table.scan(ProjectionExpression="question_id")
        all_ids = [item['question_id'] for item in response['Items']]
        if not all_ids:
            raise Exception("No questions available.")

        selected_id = random.choice(all_ids)
        question = questions_table.get_item(Key={'question_id': selected_id})['Item']

        # Send question to frontend
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'question_id': question['question_id'],
                'question_text': question['question_text'],
                'options': question['options'],
                'server_start_timestamp': int(time.time() * 1000)
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': f'Error fetching question: {str(e)}'})
        }

def process_bid_response_handler(event, context):
    try:
        body = json.loads(event['body'])
        qid = body.get('question_id')
        user_answer_id = body.get('user_answer_id')
        start_timestamp = body.get('server_start_timestamp')
        username = body.get('username', 'Anonymous')

        if not all([qid, user_answer_id, start_timestamp]):
            raise Exception("Missing required fields.")

        # Load question
        question = questions_table.get_item(Key={'question_id': qid})['Item']
        scores = {k: Decimal(str(v)) for k, v in question['relevance_scores'].items()}
        base = Decimal(str(question['base_points']))
        bonus_thresh = Decimal(str(question['time_bonus_threshold_ms']))
        current_time = int(time.time() * 1000)
        latency = current_time - start_timestamp

        # Calculate score
        score = base + scores.get(user_answer_id, Decimal(0))

        # Add bonus if fastest + best answer
        max_id = max(scores, key=scores.get)
        if user_answer_id == max_id and latency <= bonus_thresh:
            score += Decimal(50)

        # Update leaderboard
        leaderboard_table.update_item(
            Key={'username': username},
            UpdateExpression="SET total_score = if_not_exists(total_score, :zero) + :score, total_latency_ms = if_not_exists(total_latency_ms, :zlat) + :lat, last_updated = :now",
            ExpressionAttributeValues={
                ':score': score,
                ':lat': Decimal(latency),
                ':now': str(time.time()),
                ':zero': Decimal(0),
                ':zlat': Decimal(0)
            }
        )

        # Get full leaderboard
        all_entries = leaderboard_table.scan()['Items']
        leaderboard = sorted(all_entries, key=lambda x: x.get('total_score', 0), reverse=True)

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'points_earned': float(score),
                'latency_ms': latency,
                'leaderboard': [
                    {
                        'username': entry['username'],
                        'score': float(entry.get('total_score', 0)),
                        'latency': float(entry.get('total_latency_ms', 0))
                    }
                    for entry in leaderboard
                ]
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': f'Error processing response: {str(e)}'})
        }

def lambda_handler(event, context):
    path = event.get('path')
    method = event.get('httpMethod')

    if path == '/question' and method == 'GET':
        return get_question_handler(event, context)
    elif path == '/bid-response' and method == 'POST':
        return process_bid_response_handler(event, context)
    else:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Invalid endpoint'})
        }
