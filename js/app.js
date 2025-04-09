
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzivYNih0t_xoVyNarNNopchv_oPwAJmONFZwD0mZlUGf6nKzCfkKJjVO-jJ9tiDbvj/exec";

// マンション情報取得
async function fetchMansions() {
  const res = await fetch(`${GAS_ENDPOINT}?type=mansions`);
  return await res.json();
}

// 部屋情報取得
async function fetchRooms(mansionId) {
  const res = await fetch(`${GAS_ENDPOINT}?type=rooms&mansion_id=${mansionId}`);
  return await res.json();
}

// マップ初期化
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14.0, // ズームレベル
    center: { lat: 35.624574, lng: 139.631171 }, // 区域の中心地
    mapId:'665daec8de980ec1',
  });

  fetchMansions().then(mansions => {
    mansions.forEach(m => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: parseFloat(m.latitude), lng: parseFloat(m.longitude) },
        map,
      });

      marker.addListener("click", () => {
        showRoomPage(m.id, m.name);
      });
    });
  });
}

// ステータスに応じたクラスを取得
function getStatusClass(lastStatus) {
  if (!lastStatus) return "btn-danger"; // 未訪問
  if (lastStatus === "在宅") return "btn-success";
  if (lastStatus === "留守") return "btn-warning";
  if (lastStatus === "拒否") return "btn-outline-danger line-through";
  return "btn-danger";
}


// マンションマップ表示
function showMapPage() {
  document.getElementById("map-page").style.display = "block";
  document.getElementById("room-page").style.display = "none";
  document.getElementById("room-action").style.display = "none";
}

// 部屋リスト表示
function showRoomPage(mansionId, mansionName) {
  init();
  document.getElementById("map-page").style.display = "none";
  document.getElementById("room-page").style.display = "block";
  document.getElementById("room-action").style.display = "none";
  document.getElementById("mansion-title").textContent = "< "+mansionName;

  fetchRooms(mansionId).then(rooms => {
    const container = document.getElementById("room-list");
    container.innerHTML = "";

    // 部屋を floor でグループ化
    const grouped = {};
    rooms.forEach(room => {
      const floor = room.floor || "不明階"; // floor がなければ fallback
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });

    // 各階ごとに row を作る
    Object.keys(grouped).map(Number).sort((a, b) => a - b).forEach(floorNum => {
      const floor = String(floorNum);
      const floorRooms = grouped[floor];

      // フロア見出し（任意）
      const label = document.createElement("h5");
      label.textContent = `${floor}階`;
      container.appendChild(label);


      floorRooms.forEach(room => {
        // 各部屋用の行要素（タッチ範囲）
        const roomRowDiv = document.createElement("div");
        roomRowDiv.className = "row g-2 mb-2 p-2 border-bottom room-row";
        roomRowDiv.style.cursor = "pointer";
        roomRowDiv.onclick = () => showRoomActionPage(room, mansionName);

        // ボタン（状態によって見た目変わる）
        const col = document.createElement("div");
        col.className = "col-4";
        const btn = document.createElement("div"); // ← button を div に変更しても見た目維持
        const cssClass = getStatusClass(room.last_status);
        btn.className = `btn w-100 h5 ${cssClass}`;
        btn.innerHTML = room.last_status === "拒否"
          ? `<span style="text-decoration: line-through;">${room.room_number}</span>`
          : room.room_number;
        col.appendChild(btn);

        // 訪問日時表示
        const col2 = document.createElement("div");
        col2.className = "col-8";
        if (room.last_visited) {
          const date = new Date(room.last_visited);
          const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
          const dayOfWeek = weekDays[date.getDay()];
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const formattedDate = `前回${yyyy}-${mm}-${dd}(${dayOfWeek}) ${hours}:${minutes}`;

          // 記録アイコン一覧（最大10件、最新が左）
          let iconsHtml = "";
          if (room.records && room.records.length > 0) {
            room.records.slice().reverse().slice(0, 10).forEach(record => {
              let iconClass = "text-secondary";
              if (record.status === "在宅") {
                iconClass = "text-success";
              } else if (record.status === "留守") {
                iconClass = "text-warning";
              } else if (record.status === "拒否") {
                iconClass = "text-danger";
              }

              iconsHtml += `<i class="h4 mdi mdi-home ${iconClass} ms-1"></i>`;
            });
          }

          col2.innerHTML = `${formattedDate}<br>${iconsHtml}`;
        } else {
          col2.textContent = "訪問記録なし";
        }

        // 行にカラム追加してまとめて挿入
        roomRowDiv.appendChild(col);
        roomRowDiv.appendChild(col2);
        container.appendChild(roomRowDiv);
      });

    });
  });
}



// 部屋アクション表示
function showRoomActionPage(room, currentMansionName) {
  init();
  document.getElementById("map-page").style.display = "none";
  document.getElementById("room-page").style.display = "none";
  document.getElementById("room-action").style.display = "block";
  const container = document.getElementById("actions");

  // 拒否フラグの判定
  const isRejected = room.last_status === "拒否";

  // ヘッダー
  let html = `
    <h3 class="ml-2" onClick="showRoomPage(${room.mansion_id}, '${currentMansionName}')">< ${room.room_number}号室</h3>
    <div class="h4 w-100 text-center mt-5 mb-3">訪問の記録をつける</div>
  `;

  if (isRejected) {
    // 拒否されている場合の表示
    html += `
      <div class="text-danger text-center h5" role="alert">
        この部屋は「訪問拒否」として記録されています。
      </div>
    `;
  } else {
    // 通常のボタン表示
    html += `
      <div class="row g-2 mb-3" id="action-buttons">
        <div class="offset-1 col-5">
          <button id="home-button" class="btn btn-success w-100 pt-5 pb-5 h3" onclick="handleUpdateStatus(${room.id}, '在宅', ${room.mansion_id}, '${currentMansionName}')">在宅</button>
        </div>
        <div class="col-5">
          <button id="away-button" class="btn btn-warning w-100 pt-5 pb-5 h3" onclick="handleUpdateStatus(${room.id}, '留守', ${room.mansion_id}, '${currentMansionName}')">留守</button>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;

  // 記録表示（最大10件、最新が上）
  if (room.records && room.records.length > 0) {
    const historyContainer = document.getElementById("visit-history");

    // タイムライン
    const timeLineUl = document.createElement("ul");
    timeLineUl.className = "timeline";

    const sortedRecords = room.records.reverse().slice(0, 10);
    // console.log(sortedRecords);
    sortedRecords.forEach(record => {
      const date = new Date(record.created_at);
      const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
      const yyyy = String(date.getFullYear());
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mi = String(date.getMinutes()).padStart(2, '0');
      const day = weekDays[date.getDay()];
      const formatted = `${yyyy}/${mm}/${dd}(${day}) ${hh}:${mi}`; // 和暦風にしてますが西暦でもOK

      let iconClass = "text-secondary light";
      if (record.status === "在宅") {
        iconClass = "text-white success";
      } else if (record.status === "留守") {
        iconClass = "text-white warning";
      } else if (record.status === "拒否") {
        iconClass = "text-white danger";
      }

      const recordRow = document.createElement("li");
      recordRow.className = "timeline-inverted";

      recordRow.innerHTML = `
        <div class="timeline-badge ${iconClass}">
          <i class="mdi mdi-home"></i>
        </div>
        <div class="timeline-card">
          <div class="popover right">
            <div class="popover-body text-center">
              <h4>
                ${formatted}
              </h4>
              <h4>
                管理者
              </h4>
              <button class="btn btn-danger" onclick="deleteRecord(${record.id}, ${room.mansion_id}, '${currentMansionName}')">取消</button>
            </div>
          </div>
        </div>
      `;

      timeLineUl.appendChild(recordRow);
    });

    historyContainer.appendChild(timeLineUl);
  }
}


// ステータス更新
function handleUpdateStatus(roomId, status, mansionId, mansionName) {
  // スボタンを非表示
  const targetBtn = document.getElementById("action-buttons");
  if (targetBtn) targetBtn.style.display = "none";
  const visitHistory = document.getElementById("visit-history");
  if (visitHistory) visitHistory.style.display = "none";

  // ローディング表示を追加
  const container = document.getElementById("actions");
  const loading = document.createElement("div");
  loading.className = "text-center mt-3";
  loading.textContent = "データを送信中です...";
  container.appendChild(loading);

  // 通信
  updateStatus(roomId, status).then(() => {
    alert("訪問の記録が完了しました");
    showRoomPage(mansionId, mansionName);
    if (targetBtn) targetBtn.style.display = "block";
    if (visitHistory) visitHistory.style.display = "block";
  }).catch(err => {
    loading.textContent = "送信に失敗しました。";
    console.error(err);
    if (targetBtn) targetBtn.style.display = "block";
    if (visitHistory) visitHistory.style.display = "block";
  });
}

// 訪問記録
async function updateStatus(roomId, status) {
  const res = await fetch(`${GAS_ENDPOINT}?type=update_status&room_id=${roomId}&status=${status}`);
  if (!res.ok) {
    console.error("Error updating status:", res.statusText);
    return;
  }
}

// 記録削除
async function deleteRecord(recordId, mansionId, mansionName) {
  if (!confirm("この記録を取り消しますか？")) return;
  // ボタンを非表示
  const targetBtn = document.getElementById("action-buttons");
  if (targetBtn) targetBtn.style.display = "none";
  const visitHistory = document.getElementById("visit-history");
  if (visitHistory) visitHistory.style.display = "none";

  // ローディング表示を追加
  const container = document.getElementById("actions");
  const loading = document.createElement("div");
  loading.className = "text-center mt-3";
  loading.textContent = "データを送信中です...";
  container.appendChild(loading);

  try {
    // ローディング表示を追加
    const res = await fetch(`${GAS_ENDPOINT}?type=delete_record&record_id=${recordId}`);
    const json = await res.json();

    if (json.success === "OK") {
      // 最新情報を再表示
      showRoomPage(mansionId, mansionName);

      if (targetBtn) targetBtn.style.display = "block";
      if (visitHistory) visitHistory.style.display = "block";
    } else {
    }
  } catch (e) {
    console.error(e);
    alert("通信エラーが発生しました。");
  }

  if (targetBtn) targetBtn.style.display = "block";
  if (visitHistory) visitHistory.style.display = "block";
}


// 初期化
function init(){
  document.getElementById("room-list").innerHTML = `データを取得中です<br>しばらくお待ちください...`;
  document.getElementById("visit-history").innerHTML = ``;
}

