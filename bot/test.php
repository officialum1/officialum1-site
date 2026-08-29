<?php

$botToken = "7078194173:AAE1jVqLVs6S1suntVrJXbGdYAbO_QwVq-I";
$chat_id = 1057210686; // your own Telegram ID

$message = "✅ Test message: Bot is working!";

file_get_contents("https://api.telegram.org/bot$botToken/sendMessage?chat_id=$chat_id&text=".urlencode($message));

echo "Test message sent.";

?>
