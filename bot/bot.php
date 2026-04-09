<?php
// ================== CONFIG ==================
$botToken = "7078194173:AAE1jVqLVs6S1suntVrJXbGdYAbO_QwVq-I";
// ============================================

// Read Telegram update
$update = json_decode(file_get_contents('php://input'), true);

if(isset($update["message"])) {

    $chatId = $update["message"]["chat"]["id"];
    $text   = trim($update["message"]["text"]);

    // Function to send Telegram message
    function sendMessage($chatId, $message, $botToken, $replyMarkup = null){
        $url = "https://api.telegram.org/bot$botToken/sendMessage";
        $postData = [
            'chat_id'    => $chatId,
            'text'       => $message,
            'parse_mode' => 'HTML'
        ];
        if($replyMarkup !== null) {
            $postData['reply_markup'] = $replyMarkup;
        }
        $options = [
            'http' => [
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($postData),
            ],
        ];
        file_get_contents($url, false, stream_context_create($options));
    }

    function formatAgeFromTimestamp($timestamp) {
        $created = new DateTime("@$timestamp");
        $now     = new DateTime();
        $diff    = $created->diff($now);
        return $diff->y." years, ".$diff->m." months, ".$diff->d." days";
    }

    // ========== START COMMAND ==========
    if($text === "/start") {
        $keyboard = [
            "keyboard" => [
                ["👤 User Stats"]
            ],
            "resize_keyboard" => true,
            "one_time_keyboard" => false
        ];

        $welcome = "👋 <b>Welcome to the Reddit Stats Bot!</b>\n\n";
        $welcome .= "Send me any Reddit username and I'll show:\n";
        $welcome .= "• Post Karma\n• Comment Karma\n• CQ Score\n";
        $welcome .= "• Account Age\n• Created Date\n• Active / Suspended Status\n\n";
        $welcome .= "Examples:\n➡ spez\n➡ /stats spez\n➡ https://reddit.com/u/spez\n\n";
        $welcome .= "Type <b>/help</b> for more info.";
        sendMessage($chatId, $welcome, $botToken, json_encode($keyboard));
        exit;
    }

    // ========== HELP COMMAND ==========
    if($text === "/help") {
        $help = "🛠 <b>Help - Reddit Stats Bot</b>\n\n";
        $help .= "Send a Reddit username to get:\n";
        $help .= "• Post Karma\n• Comment Karma\n• CQ Score (High/Medium/Low)\n";
        $help .= "• Account Age\n• Status (Active / Suspended)\n\n";
        $help .= "Example:\n/stats spez";
        sendMessage($chatId, $help, $botToken);
        exit;
    }

    if($text === "👤 User Stats") {
        $message  = "👤 <b>User Stats Help</b>\n";
        $message .= "Send any Reddit username, /stats command, or profile link.\n";
        $message .= "Examples:\n• spez\n• /stats spez\n• https://reddit.com/u/spez";
        sendMessage($chatId, $message, $botToken);
        exit;
    }

    // ========== DETECT /stats OR PLAIN USERNAME ==========
    if(strpos($text, "/stats") === 0) {
        $parts = explode(" ", $text);
        $redditUser = $parts[1] ?? null;
    } else {
        $redditUser = $text;
    }

    // ========== CLEAN USERNAME ==========
    $redditUser = preg_replace("/^https?:\/\/(www\.)?(old\.)?reddit\.com\/(u|user)\//i", "", $redditUser);
    $redditUser = preg_replace("/^u\//i", "", $redditUser);
    $redditUser = trim($redditUser, "/");

    // ========== VALIDATION ==========
    if(!$redditUser || !preg_match("/^[A-Za-z0-9_\-]+$/", $redditUser)) {
        $msg  = "❗ I couldn't understand that.\n\n";
        $msg .= "Please send a valid Reddit username.\n";
        $msg .= "Examples:\n• spez\n• /stats spez\n• https://reddit.com/u/spez\n";
        sendMessage($chatId, $msg, $botToken);
        exit;
    }

    // ========== FETCH REDDIT DATA ==========
    $redditUrl = "https://www.reddit.com/user/$redditUser/about.json";

    $context = stream_context_create([
        "http" => [
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedditStatsBot/1.0\r\n"
        ]
    ]);

    $redditData = @file_get_contents($redditUrl, false, $context);

    if($redditData === false) {
        sendMessage($chatId, "❌ Error fetching Reddit data. Try again later.", $botToken);
        exit;
    }

    $redditData = json_decode($redditData, true);

    // ========== CHECK SUSPENDED / BANNED ==========
    if(isset($redditData["reason"]) && $redditData["reason"] === "suspended" || 
       (isset($redditData["data"]["is_suspended"]) && $redditData["data"]["is_suspended"] == true)) {
        $reply  = "📊 <b>Reddit User:</b> u/$redditUser\n\n";
        $reply .= "❌ <b>Status:</b> <b>SUSPENDED / BANNED</b>\n";
        $reply .= "🔗 Profile: https://www.reddit.com/user/$redditUser";
        sendMessage($chatId, $reply, $botToken);
        exit;
    }

    // ========== ACTIVE ACCOUNT ==========
    if(!isset($redditData["data"])) {
        sendMessage($chatId, "❌ Reddit user <b>$redditUser</b> not found.", $botToken);
        exit;
    }

    $data          = $redditData["data"];
    $postKarma     = $data["link_karma"];
    $commentKarma  = $data["comment_karma"];
    $createdUtc    = $data["created_utc"];
    $createdDate   = date("Y-m-d", $createdUtc);

    $age = formatAgeFromTimestamp($createdUtc);

    // ========== REAL-TIME CQ SCORE ==========
    $cqScore = $postKarma + $commentKarma;

    // ========== CQ SCORE LABEL ==========
    if ($cqScore >= 10000) {
        $cqLabel = "🔥 Very High";
    } elseif ($cqScore >= 5000) {
        $cqLabel = "⚡ High";
    } elseif ($cqScore >= 2000) {
        $cqLabel = "⭐ Medium";
    } elseif ($cqScore >= 500) {
        $cqLabel = "🔹 Low";
    } else {
        $cqLabel = "❄ Very Low";
    }

    // ========== FINAL REPLY ==========
    $reply  = "📊 <b>Reddit User:</b> u/$redditUser\n\n";
    $reply .= "🔶 <b>Post Karma:</b> $postKarma\n";
    $reply .= "💬 <b>Comment Karma:</b> $commentKarma\n";
    $reply .= "💯 <b>CQ Score:</b> $cqScore ($cqLabel)\n";
    $reply .= "📅 <b>Account Age:</b> $age\n";
    $reply .= "📆 <b>Created:</b> $createdDate\n";
    $reply .= "✅ <b>Status:</b> Active\n\n";
    $reply .= "🔗 <b>Profile:</b> https://www.reddit.com/user/$redditUser";

    sendMessage($chatId, $reply, $botToken);
}
?>
