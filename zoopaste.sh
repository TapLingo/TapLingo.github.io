#!/bin/bash

# 사용법 체크
if [ -z "$1" ]; then
  echo "❌ 사용법: ./zoopaste.sh <파일이름>"
  echo "예시: ./zoopaste.sh rabbit_judy"
  exit 1
fi

FILENAME="$1"
TARGET_DIR="./public/animals/zootopia"
FULL_PATH="$TARGET_DIR/$FILENAME.png"

# 디렉토리 확인 및 생성
if [ ! -d "$TARGET_DIR" ]; then
  mkdir -p "$TARGET_DIR"
  echo "📂 '$TARGET_DIR' 디렉토리를 생성했습니다."
fi

# Swift 스크립트 생성 (클립보드 -> PNG 저장)
SWIFT_SCRIPT=$(cat <<EOF
import Cocoa

let pasteboard = NSPasteboard.general
// PNG 데이터 확인
guard let data = pasteboard.data(forType: .png) ?? 
                 pasteboard.data(forType: .tiff) else { // TIFF(스크린샷 등)도 처리 시도
    print("❌ 클립보드에 이미지 데이터가 없습니다.")
    exit(1)
}

// TIFF인 경우 PNG로 변환 시도 (NSBitmapImageRep 활용)
var pngData = data
if let bitmap = NSBitmapImageRep(data: data),
   let converted = bitmap.representation(using: .png, properties: [:]) {
    pngData = converted
}

let fileURL = URL(fileURLWithPath: "$FULL_PATH")

do {
    try pngData.write(to: fileURL)
    print("✅ 저장 완료: $FULL_PATH")
} catch {
    print("❌ 파일 저장 실패: \(error)")
    exit(1)
}
EOF
)

# Swift 스크립트 실행
echo "$SWIFT_SCRIPT" | swift -

