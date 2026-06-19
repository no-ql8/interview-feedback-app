
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

import whisper
import tempfile
import os

load_dotenv()


app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3-flash-preview")

whisper_model = whisper.load_model("small")

# GeminiAOI
@app.route("/review-answer", methods=["POST"])
def review_answer():
    data = request.json
    question = data.get("question")
    answer = data.get("answer")

    try:
        prompt = f"""
        次の質問と回答について、簡単にレビューを作成してください。
        ・質問：{question}
        ・回答：{answer}
    
        """

        response = model.generate_content(
            contents=prompt)

        review_text = response.text

        return jsonify({"review": review_text})

    except Exception as e:
        print("Error:",e)
        return jsonify({"error": "Gemini API Error"}), 500

#Whisper
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "audio file missing"}), 400

    audio_file = request.files["audio"]

    #ファイルに一時的に保存
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_file.save(tmp.name)
        temp_path = tmp.name

    try:
        # 文字起こし
        result = whisper_model.transcribe(
            temp_path,
            language="ja",

            initial_prompt = (
                "プログラミング言語には、文法が簡潔なPythonやWebブラウザに使われるJavaScriptがあります。"
                "Linuxサーバーでは、GUIが充実しており、ApacheやNginxが使われます。"
                "食品衛生では、細菌や病原菌、寄生虫を原因とする食中毒対策が重要です。"
            ),
        temperature = 0.0
        )
        text = result.get("text", "")
    finally:
        #一時的に保存したファイルを削除
        os.remove(temp_path)

    return jsonify({"text": result["text"]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)