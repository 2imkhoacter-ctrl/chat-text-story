// Manual content mapping and pixel measurements; no OCR or speech processing.
const fs = require('fs');
const config = {...require('../video.config.json'), ...require('../video.v4a2.config.json')};
const speech = require('../public/generated-audio-v4a2/timing-manifest.json');
const rows = [
  ['6417',1,5,[[77,443],[446,493],[495,542],[545,591],[594,667],[670,716]],'Tâm ơi|Nhà anh hôm nay có giỗ|Khách tới kín trước cửa rồi|Anh vừa nhấc cái ghế nhà em sang bên|Cho anh đỗ nhờ 2 tiếng nhé?'],
  ['6459',6,15,[[80,125],[128,175],[178,224],[240,285],[288,334],[351,396],[400,445],[448,521],[524,570],[586,658]],'Dạ được anh|Anh chuyển em 200k là được :))|Không tính thời gian cho anh luôn|Ủa|Cái bảng tiền em ghi thật à?|Dạ thật|Phí đỗ xe anh|Anh là hàng xóm nên em không tính thời gian đó|Chứ người khác em lấy thẳng rồi|Nhưng em có trông xe cho anh đâu?'],
  ['6480',16,23,[[82,127],[131,176],[192,238],[254,299],[303,348],[365,410],[426,471],[487,533],[536,609]],'Không cần trông anh|Ai đỗ vào chỗ của em thì trả tiền thôi|Thế em đang ở nhà à?|Không anh|Em đang đi làm|Thế ai giữ chỗ?|Cái ghế :))|Thế tiền anh chuyển cho em hay cho ghế?'],
  ['6500',24,33,[[82,127],[130,177],[192,238],[241,314],[330,376],[378,452],[468,540],[556,602],[604,651],[654,700]],'Cho em anh|Ghế của em mà :))|VCL|Anh chỉ đỗ nhờ có một xíu thôi mà|Một xíu hay một chút gì cũng 200k anh ơi|Em không tính thời gian cho anh là nể lắm rồi đó|Hàng xóm với nhau mà em tính thế à?|Em phải công bằng chứ anh|Không thể người này miễn|Người kia phải đóng được'],
  ['6520',34,40,[[83,128],[131,177],[180,226],[229,276],[279,355],[372,417],[421,493],[497,542]],'Thôi được|Anh đang tiếp khách|Không muốn cãi nhau nữa|Anh chuyển em 200k|Dạ nhận rồi anh|Lần sau anh nhớ nhìn bảng trước khi đỗ nha|HAHAHA'],
  ['6541',41,51,[[80,125],[129,174],[177,223],[227,272],[275,348],[363,410],[412,459],[461,535],[537,584],[600,645],[649,694]],'Anh Phúc ơi|Hôm nay nhà em có tiệc|Khách tới đông quá|Trước nhà em kín xe rồi|Anh cho em gửi nhờ 2 ô tô trước nhà anh nhé?|Ừ em|Anh đang ở công ty|Trước nhà anh chỗ trống rộng lắm|Em cứ cho khách đỗ đi|May quá|Cảm ơn anh nha'],
  ['6557',52,62,[[77,122],[125,171],[187,233],[235,282],[285,331],[347,392],[395,441],[458,503],[519,565],[581,626],[629,675]],'Ok em|Chuyển anh 1 triệu nhé|???|1 TRIỆU???|TIỀN GÌ ANH???|Phí đỗ xe|500k một chiếc|ANH ĐÙA EM ĐẤY À???|Anh có để bảng rõ ràng mà|Bảng nào???|Em có thấy bảng gì đâu?'],
  ['6584',63,68,[[81,154],[156,230],[246,291],[295,340],[341,707],[711,756],[759,805]],'Em nhìn cái chậu cây trước cửa nhà anh đi|Cái chậu sát chỗ hai xe đang đỗ ấy|Chậu nào nhỉ?|Đợi em tí|???|ANH GIẤU CÁI BẢNG DƯỚI GỐC CÂY Á???'],
  ['6603',69,79,[[82,128],[131,177],[193,239],[255,300],[316,362],[366,411],[414,460],[464,509],[524,571],[573,620],[623,669]],'Anh có giấu đâu|Nó ở đấy từ sáng rồi|BẢNG BÉ TÍ THẾ AI MÀ THẤY???|Thì em vừa thấy rồi đấy :))|VCL|Anh chơi em à?|Hôm trước em lấy anh có 200|Giờ anh đòi tận 1 triệu???|1 Triệu đâu ra??|500k một xe thôi nhé|Hai xe mới một triệu'],
  ['6622',80,90,[[77,122],[138,211],[214,287],[290,336],[352,397],[400,446],[462,508],[511,557],[573,619],[622,668],[672,717]],'Anh lấy giá trên trời à???|Trước giờ nhà anh tính vậy thôi đó|Mà anh không tính theo giờ đâu|Đỗ 2 phút cũng thế|ĐCM|Thế em không trả thì sao?|Thì em bảo khách dời xe đi|Anh có ép đâu|Hai bác vừa vào nhà ăn rồi|Giờ em gọi ra dời xe|Khác gì đuổi khách???'],
  ['6646',91,97,[[562,608],[611,658],[674,719],[722,768],[784,830],[833,879],[882,928]],'Thế cứ để đấy em|Anh cũng không vội|Anh Phúc|Hàng xóm với nhau mà anh làm thế à?|Anh phải công bằng chứ em|Không thể người này miễn|Người kia phải đóng được'],
];
const screenshots = rows.map(([suffix, first_voice, last_voice]) => {
  const filename = `screenshot_179255${suffix}.png`;
  const b = fs.readFileSync(`public/chat-screenshots/${filename}`);
  return {filename, width:b.readUInt32BE(16),height:b.readUInt32BE(20),first_voice,last_voice,
    overlap: suffix === '6646' ? 'Partial phrase 82 and complete phrases 83–90 repeat; only 91–97 create new events.' : 'No complete repeated spoken bubble with preceding screenshot.'};
});
const reference = screenshots.reduce((a,b)=>b.height>a.height?b:a);
const scale = Math.min(config.width/reference.width,config.height/reference.height)*config.chatScale;
const events=[];
rows.forEach(([suffix,first,last,bounds,text],s) => {
  const entries=[]; const texts=text.split('|');
  if(first===1) entries.push({type:'IMAGE',voice_index:null,text:'Chair with parking / 200k sign',hold_duration:0.5});
  for(let n=first;n<=last;n++) {
    entries.push({type:'VOICE',voice_index:n,text:texts[n-first],script_text:speech.phrases[n-1].text});
    if(n===22) entries.push({type:'SILENT',voice_index:null,text:'...',hold_duration:0.5});
    if(n===37) entries.push({type:'IMAGE',voice_index:null,text:'Successful 200,000 VND transfer image',hold_duration:0.5});
    if(n===66) entries.push({type:'IMAGE',voice_index:null,text:'Plant pot with 500k / car parking sign',hold_duration:0.5});
  }
  if(entries.length!==bounds.length) throw Error('Mapping count mismatch '+suffix);
  entries.forEach((entry,i)=>{
    const [raw_top_y,raw_bubble_bottom_y]=bounds[i];
    const nextTop=bounds[i+1]?.[0] ?? screenshots[s].height;
    const mask_stop_y=(raw_bubble_bottom_y+1+nextTop)/2;
    events.push({...entry,event_id:`event-${String(events.length+1).padStart(3,'0')}`,
      screenshot:screenshots[s].filename,raw_top_y,raw_bubble_bottom_y,next_bubble_top_y:nextTop,
      mask_stop_y,final_mask_stop_y:mask_stop_y,
      canvas_mask_stop_y:Number((config.chatVerticalPosition-screenshots[s].height*scale/2+mask_stop_y*scale).toFixed(6)),
      coordinate_status:entry.voice_index===66?'REVIEW_TOUCHING_IMAGE_BOUNDARY':'SOURCE_PIXEL_MEASURED',
    });
  });
});
const result={version:'V4B',coordinate_space:'original screenshot pixels inside the shared transformed container',
  chat_scale:config.chatScale,chat_vertical_position:config.chatVerticalPosition,layout_reference:reference,
  rendered_scale:scale,screenshots,events,
  review:['All 10 screenshot switches need continuity review: fixed shared centers and original screenshots provide different message/header positions; no per-image offsets or transition effects introduced.',
    'Phrase 66 touches the plant image at raw Y=341: no empty separator row; inspect rendered antialiasing.',
    'Only sampled rendered frames are visually inspected; full 101-event pixel-perfect certification is not claimed.']};
fs.writeFileSync('data/chat-events.json',JSON.stringify(result,null,2)+'\n');
console.log(`Mapped ${screenshots.length} screenshots, ${events.length} events.`);
