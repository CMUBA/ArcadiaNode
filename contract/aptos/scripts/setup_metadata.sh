#!/bin/bash

# Load environment variables
source .env

echo "Setting up initial metadata..."

# Add Human race
echo "Adding Human race..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::metadata::set_race \
    --args u8:0 \
    --args 'vector<u16>:[10,10,10,10]' \
    --args string:"Human race with balanced attributes" \
    --args bool:true \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Add Warrior class
echo "Adding Warrior class..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::metadata::set_class \
    --args u8:0 \
    --args 'vector<u16>:[12,15,20,18]' \
    --args 'vector<u16>:[2,3,4,3]' \
    --args string:"Warrior class focused on strength" \
    --args bool:true \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Add Slash skill
echo "Adding Slash skill..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::metadata::set_skill \
    --args u8:0 \
    --args u8:0 \
    --args u8:1 \
    --args string:"Slash" \
    --args u16:100 \
    --args u16:50 \
    --args bool:true \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

echo "Initial metadata setup completed successfully!"