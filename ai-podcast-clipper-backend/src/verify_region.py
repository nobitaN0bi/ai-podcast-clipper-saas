
import modal
import os

image = (modal.Image.debian_slim().pip_install("boto3"))

app = modal.App("debug-s3-region", image=image)

@app.function(secrets=[modal.Secret.from_name("ai-podcast-clipper-secret")])
def check_region():
    import boto3
    bucket = "kriyam-podcast-clipper"
    print(f"Checking location for bucket: {bucket}")
    try:
        # Create client with default region us-east-1
        s3 = boto3.client(
            "s3",
            region_name="us-east-1",
            aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        )
        # Try list_objects which is stricter about region than head_bucket
        s3.list_objects_v2(Bucket=bucket, MaxKeys=1)
        print(f"SUCCESS: *ListObjects* worked via us-east-1. It really is us-east-1?")
        return "us-east-1"
    except Exception as e:
        # Check for region in headers
        if hasattr(e, "response") and "ResponseMetadata" in e.response:
            headers = e.response["ResponseMetadata"].get("HTTPHeaders", {})
            region = headers.get("x-amz-bucket-region")
            if region:
                print(f"SUCCESS: Found region header: {region}")
                return region
        
        print(f"ERROR: Could not infer region. Error: {e}")
        return str(e)

@app.local_entrypoint()
def main():
    print(check_region.remote())
