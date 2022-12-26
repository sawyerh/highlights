# Compile the code into a single .js file for AWS Lambda
sam build

# Create a zip file with the build file
cd .aws-sam/build/importer
zip -r --quiet build.zip *
mv build.zip ../../../

# Remove the .aws-sam folder once the zip file is created
cd ../../..
rm -rf .aws-sam

echo "\n\033[0;34m🚯 Removed .aws-sam folder since it's no longer needed."
echo "\n\033[0;32m✅ build.zip created. You can now upload it to AWS Lambda."