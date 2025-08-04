// テーブルを更新する関数
function updateTable() {
    // エラーメッセージをクリア
    document.getElementById('kankouError').innerText = '';
    document.getElementById('kaisokuError').innerText = '';

    // 入力された時刻を取得
    var kankouTime = document.getElementById('kankouTimeInput').value;
    var kaisokuTime = document.getElementById('kaisokuTimeInput').value;

    // 時刻が入力されていない場合はエラーメッセージを表示
    var hasError = false;
    if (!isValidTimeFormat(kankouTime)) {
        document.getElementById('kankouError').innerText = '時刻を正しく入力してください。';
        hasError = true;
    }
    if (!isValidTimeFormat(kaisokuTime)) {
        document.getElementById('kaisokuError').innerText = '時刻を正しく入力してください。';
        hasError = true;
    }
    if (hasError) {
        return;
    }

    // 緩行の時刻を計算して表示
    updateTimes('kankou', kankouTime, travelTimes.kankou);

    // 快速の時刻を計算して表示
    updateTimes('kaisoku', kaisokuTime, travelTimes.kaisoku);
}

// 時刻を計算して表示する関数
function updateTimes(type, startTime, times) {
    var startHours = Number(startTime.substr(0, 2));
    var startMinutes = Number(startTime.substr(2, 4));
    var startTotalMinutes = startHours * 60 + startMinutes;

    for (var place in times) {
        if (times.hasOwnProperty(place)) {
            var travelTime = times[place];
            var arrivalTime = startTotalMinutes + travelTime;
            var arrivalHours = Math.floor(arrivalTime / 60) % 24;
            var arrivalMinutes = arrivalTime % 60;
            var formattedArrivalTime = padZero(arrivalHours) + ':' + padZero(arrivalMinutes);

            document.getElementById(type + place).innerText = formattedArrivalTime;
        }
    }
}

// 0埋め関数
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 時刻形式を確認する関数
function isValidTimeFormat(time) {
    return /^\d{4}$/.test(time) && parseInt(time.slice(0, 2)) < 24 && parseInt(time.slice(2)) < 60;
}

// 現在時刻を設定する関数
function setCurrentTime(inputId) {
    var now = new Date();
    var hours = padZero(now.getHours());
    var minutes = padZero(now.getMinutes());
    document.getElementById(inputId).value = hours + '' + minutes;
}

// テーブルと入力フィールドをリセットする関数
function resetTable() {
    document.getElementById('kankouTimeInput').value = '';
    document.getElementById('kaisokuTimeInput').value = '';
    document.getElementById('kankouError').innerText = '';
    document.getElementById('kaisokuError').innerText = '';
    var ids = ['kankouShinkoiwa', 'kankouIchikawa', 'kankouFunabashi', 'kankouTsudanuma', 'kankouInage', 'kankouChiba',
        'kaisokuShinkoiwa', 'kaisokuIchikawa', 'kaisokuFunabashi', 'kaisokuTsudanuma', 'kaisokuInage', 'kaisokuChiba'];
    for (var i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).innerText = '';
    }
}