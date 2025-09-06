#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import webbrowser
import http.server
import socketserver
import threading
import os
import sys

class GameGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🎮 AWS 노들섬 퀴즈 RPG")
        self.root.geometry("500x400")
        self.root.resizable(False, False)
        
        # 서버 상태
        self.server = None
        self.server_thread = None
        self.port = 8000
        
        self.setup_ui()
        
    def setup_ui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 제목
        title_label = ttk.Label(main_frame, text="🎮 AWS 노들섬 퀴즈 RPG", 
                               font=("Arial", 18, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 10))
        
        # 부제목
        subtitle_label = ttk.Label(main_frame, text="스타듀밸리 x 포켓몬 스타일 AWS 학습 게임", 
                                  font=("Arial", 12))
        subtitle_label.grid(row=1, column=0, columnspan=2, pady=(0, 20))
        
        # 게임 특징
        features_frame = ttk.LabelFrame(main_frame, text="🎯 게임 특징", padding="10")
        features_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 20))
        
        features = [
            "🎨 스타듀밸리 스타일 픽셀 아트",
            "⚔️ 포켓몬 스타일 1:1 배틀",
            "📚 AWS CP/SAA/DVA/SAP 퀴즈",
            "🏆 레벨업 & 자격증 수집",
            "🌍 노들섬 오픈월드 탐험"
        ]
        
        for i, feature in enumerate(features):
            ttk.Label(features_frame, text=feature).grid(row=i, column=0, sticky=tk.W, pady=2)
        
        # 조작법
        controls_frame = ttk.LabelFrame(main_frame, text="🎮 조작법", padding="10")
        controls_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 20))
        
        controls = [
            "WASD: 이동",
            "Space: 상호작용", 
            "1-4: 퀴즈 답변"
        ]
        
        for i, control in enumerate(controls):
            ttk.Label(controls_frame, text=control).grid(row=i, column=0, sticky=tk.W, pady=2)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=20)
        
        # 게임 시작 버튼
        self.start_button = ttk.Button(button_frame, text="🚀 게임 시작", 
                                      command=self.start_game)
        self.start_button.grid(row=0, column=0, padx=(0, 10))
        
        # 게임 종료 버튼
        self.stop_button = ttk.Button(button_frame, text="🛑 게임 종료", 
                                     command=self.stop_game, state="disabled")
        self.stop_button.grid(row=0, column=1, padx=(10, 0))
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="게임 준비 완료", 
                                     font=("Arial", 10))
        self.status_label.grid(row=5, column=0, columnspan=2, pady=(10, 0))
        
    def start_game(self):
        try:
            # 서버 시작
            os.chdir(os.path.dirname(os.path.abspath(__file__)))
            
            class Handler(http.server.SimpleHTTPRequestHandler):
                def end_headers(self):
                    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                    self.send_header('Pragma', 'no-cache')
                    self.send_header('Expires', '0')
                    super().end_headers()
            
            self.server = socketserver.TCPServer(("", self.port), Handler)
            self.server_thread = threading.Thread(target=self.server.serve_forever)
            self.server_thread.daemon = True
            self.server_thread.start()
            
            # 브라우저에서 게임 열기
            webbrowser.open(f'http://localhost:{self.port}')
            
            # UI 업데이트
            self.start_button.config(state="disabled")
            self.stop_button.config(state="normal")
            self.status_label.config(text=f"🎮 게임 실행 중 (포트: {self.port})")
            
        except Exception as e:
            self.status_label.config(text=f"❌ 오류: {str(e)}")
    
    def stop_game(self):
        try:
            if self.server:
                self.server.shutdown()
                self.server.server_close()
                self.server = None
            
            # UI 업데이트
            self.start_button.config(state="normal")
            self.stop_button.config(state="disabled")
            self.status_label.config(text="게임 종료됨")
            
        except Exception as e:
            self.status_label.config(text=f"❌ 종료 오류: {str(e)}")
    
    def run(self):
        # 종료 시 서버 정리
        def on_closing():
            self.stop_game()
            self.root.destroy()
        
        self.root.protocol("WM_DELETE_WINDOW", on_closing)
        self.root.mainloop()

if __name__ == "__main__":
    app = GameGUI()
    app.run()