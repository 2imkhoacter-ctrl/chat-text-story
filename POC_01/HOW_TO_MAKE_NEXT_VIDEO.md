# Làm video tiếp theo — từ STABLE 1.0



Không làm dự án mới trực tiếp trong POC_01_STABLE_1.0. Copy sang thư mục làm việc riêng. STABLE là bản chuẩn đã nghe duyệt; chỉ thay đổi nội dung dự án mới trên bản copy.

## 1. Tạo và đồng bộ TTS

Tạo từng câu TTS riêng trong CapCut Mobile, hoàn thiện speed/gain mong muốn rồi đồng bộ Cloud. Giữ script có thứ tự xác định và text CapCut thực sự đọc; không dùng một master dài rồi Whisper để chia lại.

## 2. Chuẩn bị media và mapping

Đặt screenshots, gameplay và nhạc mới vào public của bản làm việc. Giữ ảnh nguyên vẹn. Chuẩn bị data/tts-script.txt và data/chat-events.json cho nội dung mới: voice_index liên tiếp, silent/image dùng null; đo đúng raw mask coordinates và image dimensions. Không tự suy luận một ảnh=một WAV; không bỏ/nhân đôi vùng ảnh overlap.

Mapping/coordinates là dữ liệu phải xác định cho mỗi video, không có OCR/mapping tự động trong pipeline hiện tại. Giữ displayText và spokenText riêng; pin các khác biệt có chủ đích trong data/capcut-tts-text-approvals.json.

## 3. Extract + validate

Chỉ trên bản video mới, với mapping/script đã sẵn sàng:

```powershell
node scripts/prepare-capcut-audio.cjs "D:\duong-dan\CapCutCloud\PROJECT_MOI" "public\capcut-tts\PROJECT_MOI"
```

Lệnh tái sử dụng WAV nếu cache hợp lệ; nếu chưa có, gọi extractor. Đọc thứ tự timeline/subdraft, source ranges và speed; tạo original/processed, manifest, validation và active.json. Nếu mismatch/link thiếu phải dừng sửa dữ liệu, không ghép đoán. Không chạy các npm scripts Whisper/FreshCut/V4G cũ.

## 4. Khai báo SFX

Chỉnh data/sfx-test01-script.txt theo script của video mới; chọn đúng file trong data/sfx-test01-config.json, giữ nguồn read-only. Khai báo TAIL/NORMAL/OVERLAY đúng loại event. Xoá hoặc cập nhật các eventHold/tailOffset/approval mang ID video cũ trên bản làm việc mới; không mang nhầm hold event-018 hoặc quy tắc nghỉ HAHA sang nội dung khác.

`node scripts/prepare-sfx-test01.cjs` chỉ dùng sau khi đã chỉnh các quy tắc riêng của script mới. Script hiện là TEST01, có kiểm tra mốc nghỉ câu40, paths manifest1022 và snapshot out/sfx-test01-before.json của video này. Vì thế nó KHÔNG phải một nút làm mọi video tùy ý; cần cập nhật các ràng buộc riêng của project trên bản làm việc rồi kiểm tra trước khi chạy. Không chạy script này để nghe lại hoặc khôi phục STABLE.

## 5. Preview

```powershell
npm run studio
```

Mở ChatTextStory-SFX-Test-01. Kiểm tra toàn bộ thoại/bubble, đủ silent/image, SFX đúng chỗ, tail không vào im lặng, next-voice gaps không cộng đôi, BOOM gain chỉ áp một lần, nhạc/gameplay không lấn tiếng. Xác nhận cuối hỗn loạn phát hết và ảnh cuối giữ đến hết.

## 6. Render khi duyệt xong

```powershell
npx remotion render src/index.jsx ChatTextStory-SFX-Test-01 out/final-next-video.mp4
```

Không dùng scripts/render-capcut-preview.cjs để xuất STABLE cóSFX vì script đó trỏ vào bản CapCut khôngSFX. Không ghi đè file thành phẩm cũ.

## Thay đổi theo video / giữ nguyên preset

- Theo video: TTS text/WAVs/speed từ CapCut, screenshots và raw mask stops, screenshot transitions, event IDs/voice mapping, silent events, SFX annotations/assets/offsets, gameplay/nhạc/path cache revision và layout nếu ảnh mới cần hiệu chuẩn.

- Giữ preset nếu chưa có yêu cầu mới:1080x1920@30fps, ChatScale0.83, centerY700, animation230ms easeInOutCubic, TTS không gain/trim thêm, BOOM+3.5dB/0.6s, TING/EMOJI phân loại bằng VOICE, gameplay-9.4dB, nhạc multiplier0.501187, full SFX/no fade/trim, giữ ảnh cuối/max(contentEnd,SFXend).

- Gain nhạc0.501187 là multiplier của file hiện tại đã được người dùng xác nhận có giảm gain khi xuất. Với file mới, phải xác nhận trạng thái gain nguồn, không mù quáng áp lại -9.4dB.

- Các ngoại lệ riêng của video này (hold0.3s câu17, nghỉ1s sauHAHA, …0.5s, approved text variants) phải được đánh giá cho nội dung mới, không coi là quy tắc mọi video.

## Khôi phục

Giữ bản backup bất biến. Dừng Studio, copy backup sang thư mục làm việc mới (ưu tiên đường dẫn gốc khi phục hồi đúng video này), đọc STABLE_1.0_CONFIG.md và đối chiếu STABLE_1.0_INVENTORY.json. Chạy Studio không cần extractor, Python hay CapCut cache. Không xóa project hiện tại trước khi đã có thêm một bản sao an toàn.

Lưu ý kiểm kê STABLE: `node_modules/.cache/` (cache build Webpack) tự thay đổi khi Studio hoạt động nên được loại khỏi hash freeze. Đây là cache có thể tạo lại, không phải code, dependencies cài đặt hay media chính thức. Bản backup có thể còn cache cũ; không cần khôi phục cache này.
