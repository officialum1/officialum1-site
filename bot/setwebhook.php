<?php

$botToken = "7078194173:AAE1jVqLVs6S1suntVrJXbGdYAbO_QwVq-I";
$webhookUrl = "https://bot.officialum1.com/bot.php";

$url = "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl";

echo file_get_contents($url);

?>
