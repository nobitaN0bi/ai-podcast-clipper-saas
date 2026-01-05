
import boto3
import os

key_id = os.environ.get("AWS_ACCESS_KEY_ID")
secret = os.environ.get("AWS_SECRET_ACCESS_KEY")
bucket_name = "kriyam-podcast-clipper"

try:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        region_name="us-east-1" # Default to check
    )
    
    print(f"Checking bucket: {bucket_name}")
    response = s3_client.get_bucket_location(Bucket=bucket_name)
    location = response['LocationConstraint']
    
    if location is None:
        location = "us-east-1"
    
    print(f"RESULT: Bucket region is: {location}")

except Exception as e:
    print(f"ERROR: {e}")
