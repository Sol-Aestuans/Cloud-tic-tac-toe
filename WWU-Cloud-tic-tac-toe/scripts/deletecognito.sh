echo "Deleting Amazon Cognito User Pool"
POOL=$(aws cognito-idp delete-user-pool \
  --user-pool-id ${USER_POOL_ID})