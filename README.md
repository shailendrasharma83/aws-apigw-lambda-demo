# aws-apigw-lambda-demo
########################

    Create aws profile "sandbox"
    Load aws profile "sandbox"
    export AWS_PROFILE=sandbox

   
   # Validate templates
   
    cd cloudformation
   
    aws --profile sandbox cloudformation validate-template --template-body file://iam.yaml
   
    aws --profile sandbox cloudformation validate-template --template-body file://pre-requisite.yaml
   
   # npm install
    npm install --prod
   
   # Create IAM Roles
    aws --profile sandbox cloudformation create-stack --stack-name MySkillsDemoIAMRoles --template-body file://iam.yaml --capabilities CAPABILITY_NAMED_IAM
   # Create S3 bucket and KMS key
    aws --profile sandbox cloudformation create-stack --stack-name MySkillsDemoPrerequisites --template-body file://pre-requisite.yaml --capabilities CAPABILITY_NAMED_IAM
   
   **Note** :: As these commands are being executed in the context of an IAM user, the IAM user need to he added in the principal for S3 bucket policy and allow usage block in KMS
  
  **Example :: S3 Bucket policy**
  
            "AWS": [
                       "arn:aws:iam::************:role/CloudFormationRole",
                       "arn:aws:iam::************:user/*******.*******.com"
                   ] 
                   
  **Example :: KMS**
  
            {
               "Sid": "Allow use of the key for Cloudformation Role",
               "Effect": "Allow",
               "Principal": {
                   "AWS": [
                       "arn:aws:iam::************:role/CloudFormationRole",
                        "arn:aws:iam::************:user/*******.*******.com"
                   ]
               },
               "Action": [
                   "kms:Encrypt",
                   "kms:Decrypt",
                   "kms:ReEncrypt*",
                   "kms:GenerateDataKey*",
                   "kms:DescribeKey"
               ],
               "Resource": "*"
           }  
           
  
  # Create SSM Param "rate-map" as
  
    aws ssm put-parameter --name rate-map --value file://config/ssm.json --type String --overwrite
 
 
  # Running Tests
  
     npm run test
 

  # Run CloudFormation commands for deployment
    
    cd ..
    
    aws cloudformation package --template-file template.yaml --output-template-file template-export.yaml --s3-bucket my-skills-demo-deployment-bucket  --kms-key-id alias/my-skills-demo-key
    
    aws cloudformation deploy --template-file template-export.yaml --stack-name my-skills-demo --s3-bucket my-skills-demo-deployment-bucket --kms-key-id  alias/my-skills-demo-key --capabilities CAPABILITY_NAMED_IAM  --role-arn arn:aws:iam::<account-id>:role/CloudFormationRole --parameter-overrides ExecutionRole=arn:aws:iam::<account-id>:role/LambdaRole
    
    Note :: Replace <account-id> with actual AWS Account Id
        
# Security
  
     1) API can be secured either by adding a API key which is a pretty loose way of authenticating as the api key is sent to client/browser from where its easily retrievable.
     2) Add a cognito user pool authorizer and map cognito pool with AD through SAML federation
     3) Add a custom auth lambda and write logic to authenticate
     4) Use Developer authenticated identities
     5) APIs can be further guarded by allowing traffic from certain IP CIDRs i.e. IPs of WAF 
