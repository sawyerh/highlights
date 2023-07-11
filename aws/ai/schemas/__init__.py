# See https://docs.powertools.aws.dev/lambda/python/latest/utilities/validation

POST_EMBEDDINGS_BODY = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "type": "object",
    "properties": {
        "highlights": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "body": {"type": "string"},
                    "highlight_key": {"type": "string"},
                    "volume_key": {"type": "string"},
                    "volume_title": {"type": "string"},
                    "volume_subtitle": {"type": "string"},
                },
                "required": ["body", "highlight_key", "volume_key", "volume_title"],
            },
        }
    },
    "required": ["highlights"],
}
