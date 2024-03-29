from dataclasses import dataclass

import pytest
from handler import lambda_handler


@pytest.fixture
def lambda_context():
    @dataclass
    class LambdaContext:
        function_name: str = "test"
        memory_limit_in_mb: int = 128
        invoked_function_arn: str = (
            "arn:aws:lambda:eu-west-1:123456789012:function:test"
        )
        aws_request_id: str = "da658bd3-2d6f-4e7b-8ec2-937234644fdc"

    return LambdaContext()


def test_delete_rejected_missing_secret(lambda_context):
    minimal_event = {
        "rawPath": "/embeddings",
        "requestContext": {
            "requestContext": {
                "requestId": "227b78aa-779d-47d4-a48e-ce62120393b8"
            },  # correlation ID
            "http": {
                "method": "DELETE",
            },
            "stage": "$default",
        },
    }

    res = lambda_handler(minimal_event, lambda_context)
    body_dict = eval(res["body"])
    assert res["statusCode"] == 400
    assert body_dict["message"] == "Missing client secret"


@pytest.mark.parametrize(
    "http_method,path", [("POST", "/embeddings"), ("DELETE", "/embeddings")]
)
def test_rejects_incorrect_secret(http_method, path, lambda_context):
    minimal_event = {
        "rawPath": path,
        "requestContext": {
            "requestContext": {
                "requestId": "227b78aa-779d-47d4-a48e-ce62120393b8"
            },  # correlation ID
            "http": {"method": http_method},
            "stage": "$default",
        },
        "headers": {"X-Api-Key": "wrong-secret"},
    }

    res = lambda_handler(minimal_event, lambda_context)
    body_dict = eval(res["body"])
    assert res["statusCode"] == 400
    assert body_dict["message"] == "Invalid client secret"
