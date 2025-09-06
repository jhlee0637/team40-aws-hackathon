#!/usr/bin/env python3
import tkinter as tk
import webbrowser
import http.server
import socketserver
import threading
import os

def start_game():
    try:
        # 서버 시작
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # 사용 가능한 포트 찾기
        for port in range(8000, 8010):
            try:
                server = socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler)
                thread = threading.Thread(target=server.serve_forever)
                thread.daemon = True
                thread.start()
                
                # 브라우저 열기
                webbrowser.open(f'http://localhost:{port}')
                
                status_label.config(text=f"게임 실행 중! 포트: {port}")
                return
            except OSError:
                continue
        
        status_label.config(text="사용 가능한 포트를 찾을 수 없습니다.")
        
    except Exception as e:
        status_label.config(text=f"오류: {str(e)}")

# GUI 생성
root = tk.Tk()
root.title("AWS 노들섬 퀴즈 RPG")
root.geometry("400x300")

# 제목
title_label = tk.Label(root, text="🎮 AWS 노들섬 퀴즈 RPG", font=("Arial", 16, "bold"))
title_label.pack(pady=20)

# 설명
desc_label = tk.Label(root, text="스타듀밸리 x 포켓몬 스타일\nAWS 자격증 학습 게임", font=("Arial", 12))
desc_label.pack(pady=10)

# 게임 시작 버튼
start_button = tk.Button(root, text="🚀 게임 시작", command=start_game, 
                        font=("Arial", 14), bg="#4CAF50", fg="white", 
                        width=15, height=2)
start_button.pack(pady=20)

# 상태 표시
status_label = tk.Label(root, text="게임 시작 버튼을 클릭하세요!", font=("Arial", 10), wraplength=350)
status_label.pack(pady=10)

# 조작법
controls_label = tk.Label(root, text="조작법: WASD(이동), Space(상호작용), 1-4(퀴즈답변)", 
                         font=("Arial", 9), fg="gray")
controls_label.pack(pady=10)

root.mainloop()