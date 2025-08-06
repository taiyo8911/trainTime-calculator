// 出発駅・方向選択時にテーブルを更新する関数
function updateTableStructure() {
    var departureStation = document.getElementById('departureStation').value;
    var direction = document.querySelector('input[name="direction"]:checked');

    // エラーメッセージをクリア
    document.getElementById('directionError').innerText = '';

    if (!direction) {
        return;
    }

    var directionValue = direction.value;

    // 端駅での無効方向チェック
    if ((departureStation === '千葉' && directionValue === '千葉方面') ||
        (departureStation === '錦糸町' && directionValue === '錦糸町方面')) {
        document.getElementById('directionError').innerText = 'この方向には駅がありません。';
        return;
    }

    // 表示する駅リストを生成
    var displayStations = getDisplayStations(departureStation, directionValue);

    // テーブルを動的生成
    generateTable(displayStations, departureStation);

    // 計算結果をクリア
    clearResults();
}

// 表示する駅リストを取得する関数
function getDisplayStations(departureStation, direction) {
    var departureIndex = stations.indexOf(departureStation);
    var displayStations = [];

    if (direction === '千葉方面') {
        // 錦糸町→千葉方向
        for (var i = departureIndex; i < stations.length; i++) {
            displayStations.push(stations[i]);
        }
    } else {
        // 千葉→錦糸町方向
        for (var i = departureIndex; i >= 0; i--) {
            displayStations.push(stations[i]);
        }
    }

    return displayStations;
}

// テーブルを動的生成する関数
function generateTable(displayStations, departureStation) {
    var tableBody = document.querySelector('#timeTable tbody');
    tableBody.innerHTML = '';

    // ヘッダーを更新（列方向：緩行・急行）
    var tableHeader = document.querySelector('#timeTable thead tr');
    tableHeader.innerHTML = '<th></th><th>緩行</th><th>急行</th>';

    // 各駅ごとに行を生成（行方向：駅名）
    for (var i = 0; i < displayStations.length; i++) {
        var station = displayStations[i];
        var stationRow = document.createElement('tr');

        // 駅名
        stationRow.innerHTML = '<th>' + station + '</th>';

        if (station === departureStation) {
            // 出発駅の場合：入力欄を表示
            stationRow.innerHTML += '<td><div><input type="time" id="kankouTimeInput"><span id="kankouError" class="error"></span></div></td>';
            stationRow.innerHTML += '<td><div><input type="time" id="kyuukouTimeInput"><span id="kyuukouError" class="error"></span></div></td>';
        } else {
            // 他の駅の場合：計算結果表示エリア
            stationRow.innerHTML += '<td id="kankou' + station + '"></td>';
            stationRow.innerHTML += '<td id="kyuukou' + station + '"></td>';
        }

        tableBody.appendChild(stationRow);
    }
}

// テーブルを更新する関数（計算実行）
function updateTable() {
    // エラーメッセージをクリア
    document.getElementById('kankouError').innerText = '';
    document.getElementById('kyuukouError').innerText = '';

    // 選択状態を確認
    var departureStation = document.getElementById('departureStation').value;
    var direction = document.querySelector('input[name="direction"]:checked');

    if (!direction) {
        alert('方向を選択してください。');
        return;
    }

    var directionValue = direction.value;

    // 端駅での無効方向チェック
    if ((departureStation === '千葉' && directionValue === '千葉方面') ||
        (departureStation === '錦糸町' && directionValue === '錦糸町方面')) {
        return;
    }

    // 入力された時刻を取得
    var kankouTime = document.getElementById('kankouTimeInput').value;
    var kyuukouTime = document.getElementById('kyuukouTimeInput').value;

    // 時刻が入力されていない場合はエラーメッセージを表示
    var hasError = false;
    if (!isValidTimeFormat(kankouTime)) {
        document.getElementById('kankouError').innerText = '時刻を入力してください。';
        hasError = true;
    }
    if (!isValidTimeFormat(kyuukouTime)) {
        document.getElementById('kyuukouError').innerText = '時刻を入力してください。';
        hasError = true;
    }
    if (hasError) {
        return;
    }

    // 表示する駅リストを取得
    var displayStations = getDisplayStations(departureStation, directionValue);

    // 緩行の時刻を計算して表示
    updateTimes('kankou', kankouTime, displayStations, departureStation, directionValue);

    // 急行の時刻を計算して表示
    updateTimes('kyuukou', kyuukouTime, displayStations, departureStation, directionValue);
}

// 時刻を計算して表示する関数
function updateTimes(trainType, startTime, displayStations, departureStation, direction) {
    // HH:MM形式の時刻を分に変換
    var timeParts = startTime.split(':');
    var startHours = parseInt(timeParts[0]);
    var startMinutes = parseInt(timeParts[1]);
    var startTotalMinutes = startHours * 60 + startMinutes;

    // 列車種別の日本語名を取得
    var trainTypeJapanese = trainType === 'kankou' ? '緩行' : '急行';

    for (var i = 0; i < displayStations.length; i++) {
        var station = displayStations[i];
        if (station === departureStation) {
            continue; // 出発駅はスキップ
        }

        // 所要時間を計算
        var travelTime = calculateTravelTime(departureStation, station, direction, trainTypeJapanese);
        var arrivalTime = startTotalMinutes + travelTime;
        var arrivalHours = Math.floor(arrivalTime / 60) % 24;
        var arrivalMinutes = arrivalTime % 60;
        var formattedArrivalTime = padZero(arrivalHours) + ':' + padZero(arrivalMinutes);

        document.getElementById(trainType + station).innerText = formattedArrivalTime;
    }
}

// 駅間の所要時間を計算する関数
function calculateTravelTime(fromStation, toStation, direction, trainType) {
    var directionKey = direction === '千葉方面' ? '千葉方面' : '錦糸町方面';
    var fromTime = travelTimes[directionKey][trainType][fromStation];
    var toTime = travelTimes[directionKey][trainType][toStation];

    return Math.abs(toTime - fromTime);
}

// 計算結果をクリアする関数
function clearResults() {
    var resultCells = document.querySelectorAll('td[id^="kankou"], td[id^="kyuukou"]');
    for (var i = 0; i < resultCells.length; i++) {
        if (!resultCells[i].querySelector('input')) {
            resultCells[i].innerText = '';
        }
    }
}

// 0埋め関数
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 時刻形式を確認する関数
function isValidTimeFormat(time) {
    // HTML5のtime入力は自動的に正しい形式になるため、空文字のチェックのみ
    return time && time.trim() !== '';
}

// 現在時刻を設定する関数
function setCurrentTime() {
    var now = new Date();
    var hours = padZero(now.getHours());
    var minutes = padZero(now.getMinutes());
    var currentTime = hours + ':' + minutes;

    var kankouInput = document.getElementById('kankouTimeInput');
    var kyuukouInput = document.getElementById('kyuukouTimeInput');

    if (kankouInput) kankouInput.value = currentTime;
    if (kyuukouInput) kyuukouInput.value = currentTime;
}

// テーブルと入力フィールドをリセットする関数
function resetTable() {
    // 入力フィールドをリセット
    var kankouInput = document.getElementById('kankouTimeInput');
    var kyuukouInput = document.getElementById('kyuukouTimeInput');
    var kankouError = document.getElementById('kankouError');
    var kyuukouError = document.getElementById('kyuukouError');

    if (kankouInput) kankouInput.value = '';
    if (kyuukouInput) kyuukouInput.value = '';
    if (kankouError) kankouError.innerText = '';
    if (kyuukouError) kyuukouError.innerText = '';

    // 計算結果をクリア
    clearResults();
}