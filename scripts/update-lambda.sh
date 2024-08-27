zip -rq application.zip application/
aws lambda update-function-code --function-name turn-based-api --zip-file fileb://application.zip