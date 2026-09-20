async function loadArenaChannel(channelSlug, targetId) {
  const target = document.getElementById(targetId);

  if (!target || !channelSlug) return;

  try {
    let page = 1;
    let allBlocks = [];

    // Are.na 블록을 100개씩 모든 페이지에서 가져오기
    while (true) {
      const response = await fetch(
        `https://api.are.na/v2/channels/${channelSlug}/contents?per=100&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`Are.na API error: ${response.status}`);
      }

      const data = await response.json();
      const blocks = data.contents || [];

      allBlocks.push(...blocks);

      // 가져온 블록이 100개보다 적으면 마지막 페이지
      if (blocks.length < 100) {
        break;
      }

      page++;
    }


    // 이미지 블록만 선택
    const imageBlocks = allBlocks.filter(
      block => block.class === "Image"
    );


    // 기존 내용 비우기
    target.innerHTML = "";


    // 이미지 생성
    imageBlocks.forEach(block => {

      const imgUrl =
        block.image?.display?.url ||
        block.image?.original?.url;

      if (!imgUrl) return;


      // 이미지 + 캡션 묶음
      const figure = document.createElement("figure");


      // 이미지
      const img = document.createElement("img");

      img.src = imgUrl;
      img.alt = block.title || "Are.na image";

      // 화면 근처에 왔을 때 이미지 로드
      img.loading = "lazy";


// 이미지 클릭 → 확대
img.addEventListener("click", () => {
  const images = Array.from(
    document.querySelectorAll(".arena-gallery img")
  );

  let currentIndex = images.indexOf(img);

  const overlay = document.createElement("div");
  overlay.className = "image-overlay";

  const enlargedImg = document.createElement("img");

  function showImage(index) {
    currentIndex = index;
    enlargedImg.src = images[currentIndex].src;
    enlargedImg.alt = images[currentIndex].alt;
  }

  showImage(currentIndex);

  overlay.appendChild(enlargedImg);
  document.body.appendChild(overlay);


  // 확대 이미지 클릭 → 닫기
  enlargedImg.addEventListener("click", () => {
    closeOverlay();
  });


  // 방향키
  function handleKeydown(event) {

    // 다음 이미지
    if (event.key === "ArrowRight") {
      currentIndex =
        (currentIndex + 1) % images.length;

      showImage(currentIndex);
    }

    // 이전 이미지
    if (event.key === "ArrowLeft") {
      currentIndex =
        (currentIndex - 1 + images.length) % images.length;

      showImage(currentIndex);
    }

    // ESC로 닫기
    if (event.key === "Escape") {
      closeOverlay();
    }
  }


  function closeOverlay() {
    overlay.remove();
    document.removeEventListener(
      "keydown",
      handleKeydown
    );
  }


  document.addEventListener(
    "keydown",
    handleKeydown
  );
});


      figure.appendChild(img);

      // Are.na description → 이미지 캡션
      if (block.description) {

        const caption =
          document.createElement("figcaption");

        caption.innerHTML = block.description;

        figure.appendChild(caption);
      }


      // 갤러리에 추가
      target.appendChild(figure);

    });


  } catch (error) {

    console.error(
      `Failed to load channel ${channelSlug}:`,
      error
    );

    target.innerHTML =
      "<p>이미지를 불러오지 못했습니다.</p>";
  }
}

// ------------------------------------
// Are.na 채널 연결
// "" 안에 채널 slug 입력
// ------------------------------------

loadArenaChannel("luxor-eowxhyxh_as", "arena-01");

loadArenaChannel("", "arena-03");