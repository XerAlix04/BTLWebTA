using Microsoft.AspNetCore.Mvc;
using NAudio.Wave;
using NAudio.Wave.SampleProviders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace Project1.Controllers
{
    public class SpeechController : Controller
    {
        // 🔑 Deepgram API Key
        private readonly string _deepgramKey = "4d44c570b42a0511e99eb6d19ce73d125553716e";

        // 📘 Danh sách từ luyện phát âm
        private static readonly List<string> WordList = new()
        {
            "apple", "banana", "computer", "friend", "music",
            "teacher", "beautiful", "weather", "language", "travel",
            "university", "family", "restaurant", "library", "holiday",
            "coffee", "morning", "chocolate", "elephant", "information"
        };

        // 🎲 Lấy ngẫu nhiên 1 từ
        private string GetRandomWord()
        {
            var rand = new Random();
            return WordList[rand.Next(WordList.Count)];
        }

        /// <summary>
        /// 🔹 Hiển thị giao diện luyện nói
        /// </summary>
        [HttpGet]
        public IActionResult Index()
        {
            string randomWord = GetRandomWord();
            ViewBag.Word = randomWord;
            ViewBag.ReferenceText = randomWord;
            return View();
        }

        /// <summary>
        /// 🔹 API trả JSON khi gọi fetch để đổi từ
        /// </summary>
        [HttpGet]
        [Route("Speech/Index")]
        public IActionResult GetRandomWordJson()
        {
            string randomWord = GetRandomWord();
            return Json(new { randomWord });
        }

        /// <summary>
        /// 📦 Gửi file âm thanh + referenceText để Deepgram chấm điểm
        /// </summary>
        [HttpPost]
        [Route("Speech/Check")]
        public async Task<IActionResult> Check(IFormFile audio, string referenceText)
        {
            if (audio == null || audio.Length == 0)
                return BadRequest("Không có file âm thanh được gửi lên.");

            if (string.IsNullOrWhiteSpace(referenceText))
                return BadRequest("Thiếu referenceText.");

            // Tạo thư mục lưu
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/audio");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // 🔥 Tên file an toàn GUID (tránh lỗi overwrite)
            var safeFileName = Guid.NewGuid() + Path.GetExtension(audio.FileName);
            var originalFilePath = Path.Combine(uploadsFolder, safeFileName);

            // Lưu file gốc
            using (var stream = new FileStream(originalFilePath, FileMode.Create))
            {
                await audio.CopyToAsync(stream);
            }

            // Convert sang WAV PCM16 16kHz mono
            var wavFilePath = Path.Combine(
                uploadsFolder,
                Path.GetFileNameWithoutExtension(originalFilePath) + "_converted.wav"
            );

            try
            {
                ConvertToWavPcm16(originalFilePath, wavFilePath);
            }
            catch
            {
                ViewBag.ScoreResult = "<span style='color:red;'>❌ Lỗi khi chuyển đổi âm thanh.</span>";
                return View("Result");
            }

            // Gọi Deepgram
            string transcript = "";
            try
            {
                transcript = await TranscribeWithDeepgramAsync(wavFilePath);
            }
            catch (Exception ex)
            {
                ViewBag.ScoreResult = $"<span style='color:red;'>❌ Lỗi khi chấm điểm: {ex.Message}</span>";
                return View("Result");
            }

            // Tính điểm
            double score = CalculateSimpleAccuracy(transcript, referenceText);

            // Trả về View
            ViewBag.ScoreResult = $@"
                <b>🔹 Từ cần đọc:</b> {referenceText}<br/>
                <b>🗣️ Bạn phát âm:</b> {transcript}<br/>
                <b>🎯 Điểm accuracy:</b> {score:F1}%";

            ViewBag.AudioFile = "/audio/" + Path.GetFileName(wavFilePath);
            ViewBag.RandomWord = referenceText;

            return View("Result");
        }

        // Chuyển file sang WAV PCM16 16kHz mono
        private void ConvertToWavPcm16(string inputPath, string outputPath)
        {
            using var reader = new AudioFileReader(inputPath); // hỗ trợ MP3/MP4/WAV

            var targetFormat = new WaveFormat(16000, 16, 1); // PCM16, mono, 16kHz
            var resampler = new WdlResamplingSampleProvider(reader, targetFormat.SampleRate);

            // Convert stereo → mono nếu file có 2 kênh
            ISampleProvider monoProvider = reader.WaveFormat.Channels == 1
                ? resampler
                : new StereoToMonoSampleProvider(resampler);

            // Ghi file WAV PCM16 chuẩn
            WaveFileWriter.CreateWaveFile16(outputPath, monoProvider);
        }


        // Gọi Deepgram
        private async Task<string> TranscribeWithDeepgramAsync(string wavPath)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Token", _deepgramKey);

            // ⚠️ Sửa: Phải gọi System.IO.File
            var audioBytes = await System.IO.File.ReadAllBytesAsync(wavPath);

            // 🆗 MIME chuẩn cho WAV PCM16
            using var content = new ByteArrayContent(audioBytes);
            content.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
            content.Headers.ContentType.Parameters.Add(new NameValueHeaderValue("codec", "pcm_s16le"));

            var response = await httpClient.PostAsync(
                "https://api.deepgram.com/v1/listen?model=general&language=en-US&encoding=linear16&sample_rate=16000",
                content
            );

            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception("❌ Lỗi Deepgram: " + json);

            using var doc = JsonDocument.Parse(json);

            return doc.RootElement
                .GetProperty("results")
                .GetProperty("channels")[0]
                .GetProperty("alternatives")[0]
                .GetProperty("transcript")
                .GetString();
        }





        // Tính điểm đơn giản
        private double CalculateSimpleAccuracy(string spoken, string reference)
        {
            if (string.IsNullOrWhiteSpace(spoken))
                return 0;

            var spokenWords = spoken.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var referenceWords = reference.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            int correct = 0;
            foreach (var word in referenceWords)
            {
                if (Array.Exists(spokenWords, w => w == word))
                    correct++;
            }

            return 100.0 * correct / referenceWords.Length;
        }
    }
}
