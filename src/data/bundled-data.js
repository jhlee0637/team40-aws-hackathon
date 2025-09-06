/**
 * 자동 생성된 번들 데이터 파일
 * 생성 시간: 2025-09-06T13:35:47.899890
 * 
 * 이 파일은 자동으로 생성됩니다. 직접 편집하지 마세요.
 * 대신 data/ 폴더의 JSON 파일을 편집하고 python scripts/bundle-data.py를 실행하세요.
 */

export const GAME_DATA = {
  "config": {
    "game": {
      "title": "AWS 노들섬 퀴즈 배틀 RPG",
      "version": "1.0.0",
      "canvas": {
        "width": 800,
        "height": 600
      },
      "player": {
        "startX": 400,
        "startY": 600,
        "speed": 2,
        "startHp": 100,
        "startLevel": 1,
        "startCredits": 1000
      },
      "camera": {
        "smoothing": 0.08,
        "bounds": true
      },
      "battle": {
        "damageMultiplier": {
          "correct": 25,
          "wrong": 15
        },
        "expGain": {
          "base": 50,
          "perLevel": 10
        },
        "creditsGain": {
          "base": 100,
          "perLevel": 25
        }
      },
      "sprites": {
        "path": "assets/sprites/",
        "files": [
          "buildings.svg",
          "player.svg",
          "monsters.svg",
          "npc.svg"
        ]
      },
      "audio": {
        "enabled": true,
        "volume": 0.7,
        "bgm": "assets/audio/bgm.mp3",
        "sfx": {
          "battle": "assets/audio/battle.mp3",
          "victory": "assets/audio/victory.mp3",
          "defeat": "assets/audio/defeat.mp3"
        }
      }
    },
    "ui": {
      "colors": {
        "primary": "#FF9900",
        "secondary": "#1565C0",
        "success": "#4CAF50",
        "danger": "#F44336",
        "warning": "#FFD700",
        "info": "#2196F3",
        "dark": "#424242",
        "light": "#FFFFFF"
      },
      "fonts": {
        "primary": "monospace",
        "sizes": {
          "small": "10px",
          "medium": "12px",
          "large": "16px",
          "xlarge": "20px"
        }
      },
      "layout": {
        "topBar": {
          "height": 50,
          "background": "rgba(0, 0, 0, 0.7)"
        },
        "bottomBar": {
          "height": 30,
          "background": "rgba(0, 0, 0, 0.5)"
        },
        "battleUI": {
          "questionPanel": {
            "x": 50,
            "y": -220,
            "width": -100,
            "height": 170,
            "background": "rgba(0, 0, 0, 0.8)"
          }
        }
      },
      "animations": {
        "fadeIn": {
          "duration": 300,
          "easing": "ease-in"
        },
        "slideUp": {
          "duration": 500,
          "easing": "ease-out"
        }
      },
      "controls": {
        "movement": [
          "WASD",
          "Arrow Keys"
        ],
        "interact": [
          "Space"
        ],
        "battle": [
          "1-4 Keys",
          "Mouse Click"
        ]
      }
    }
  },
  "entities": {
    "monsters": [
      {
        "x": 10,
        "y": 20,
        "name": "S3 버킷몬",
        "type": "s3",
        "hp": 60,
        "maxHp": 60,
        "level": 3,
        "cert": "cp",
        "zone": "beginner",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "random"
      },
      {
        "x": 18,
        "y": 25,
        "name": "EC2 컴퓨터",
        "type": "ec2",
        "hp": 70,
        "maxHp": 70,
        "level": 4,
        "cert": "cp",
        "zone": "beginner",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "patrol"
      },
      {
        "x": 12,
        "y": 40,
        "name": "람다 함수",
        "type": "lambda",
        "hp": 50,
        "maxHp": 50,
        "level": 2,
        "cert": "cp",
        "zone": "beginner",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "teleport"
      },
      {
        "x": 30,
        "y": 20,
        "name": "VPC 네트워크",
        "type": "vpc",
        "hp": 100,
        "maxHp": 100,
        "level": 6,
        "cert": "saa",
        "zone": "forest",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "guard"
      },
      {
        "x": 45,
        "y": 35,
        "name": "ELB 로드밸런서",
        "type": "elb",
        "hp": 90,
        "maxHp": 90,
        "level": 5,
        "cert": "saa",
        "zone": "forest",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "defensive"
      },
      {
        "x": 55,
        "y": 25,
        "name": "EKS 쿠버네티스",
        "type": "eks",
        "hp": 150,
        "maxHp": 150,
        "level": 10,
        "cert": "dva",
        "zone": "mountain",
        "defeated": false,
        "moveTimer": 0,
        "movePattern": "swarm"
      }
    ],
    "gymLeaders": [
      {
        "x": 16,
        "y": 30,
        "name": "박클라우드",
        "title": "CP 관장",
        "cert": "cp",
        "zone": "beginner",
        "defeated": false,
        "sprite": "cp_leader",
        "badge": "Foundation Badge",
        "dialogue": [
          "안녕하세요! 노들섬 AWS 클라우드 프랙티셔너 관장 박클라우드입니다.",
          "클라우드의 기초 개념부터 차근차근 배워보시죠!",
          "AWS의 기본 서비스들을 마스터할 준비가 되셨나요?"
        ],
        "battleIntro": "클라우드의 기초를 보여드리겠습니다!",
        "victory": "훌륭합니다! Foundation Badge를 드립니다!",
        "defeat": "더 공부하고 다시 도전하세요!",
        "certDetails": {
          "fullName": "AWS Certified Cloud Practitioner",
          "code": "CLF-C01",
          "duration": "90분",
          "questions": "65문항",
          "passingScore": "700/1000점",
          "cost": "$100",
          "validity": "3년",
          "domains": [
            "클라우드 개념 (26%)",
            "보안 및 규정 준수 (25%)",
            "기술 (33%)",
            "청구 및 요금 (16%)"
          ]
        }
      },
      {
        "x": 36,
        "y": 25,
        "name": "김아키텍트",
        "title": "SAA 관장",
        "cert": "saa",
        "zone": "forest",
        "defeated": false,
        "sprite": "saa_leader",
        "badge": "Architect Badge",
        "dialogue": [
          "솔루션 아키텍트 관장 김아키텍트입니다.",
          "확장 가능하고 안정적인 아키텍처 설계의 세계로 오신 것을 환영합니다!",
          "고가용성과 내결함성에 대해 알아볼까요?"
        ],
        "battleIntro": "진정한 아키텍처의 힘을 보여드리겠습니다!",
        "victory": "놀랍습니다! Architect Badge를 획득하셨습니다!",
        "defeat": "아키텍처는 더 깊이 있는 이해가 필요합니다.",
        "certDetails": {
          "fullName": "AWS Certified Solutions Architect Associate",
          "code": "SAA-C03",
          "duration": "130분",
          "questions": "65문항",
          "passingScore": "720/1000점",
          "cost": "$150",
          "validity": "3년",
          "domains": [
            "보안 아키텍처 설계 (30%)",
            "복원력 있는 아키텍처 설계 (26%)",
            "고성능 아키텍처 설계 (24%)",
            "비용 최적화 아키텍처 설계 (20%)"
          ]
        }
      }
    ],
    "npcs": [
      {
        "x": 20,
        "y": 30,
        "name": "AWS 가이드",
        "type": "guide",
        "dialogue": [
          "안녕하세요! AWS 노들섬에 오신 것을 환영합니다!",
          "이곳에서 AWS 자격증을 위한 퀴즈 배틀을 즐기실 수 있어요.",
          "체육관 관장들과 배틀하여 자격증 배지를 획득해보세요!"
        ],
        "sprite": "guide_npc"
      },
      {
        "x": 35,
        "y": 40,
        "name": "상점 주인",
        "type": "shop",
        "dialogue": [
          "어서오세요! AWS 크레딧으로 아이템을 구매하실 수 있어요.",
          "체력 회복 포션이나 경험치 부스터는 어떠세요?"
        ],
        "sprite": "shop_npc",
        "items": [
          {
            "name": "체력 포션",
            "price": 50,
            "effect": "hp_restore"
          },
          {
            "name": "경험치 부스터",
            "price": 100,
            "effect": "exp_boost"
          }
        ]
      }
    ]
  },
  "quiz": {
    "saa": [
      {
        "question": "Multi-AZ RDS 배포의 주요 목적은?",
        "options": [
          "성능 향상",
          "고가용성",
          "비용 절감",
          "보안 강화"
        ],
        "correct": 1,
        "explanation": "Multi-AZ는 고가용성과 자동 장애 조치를 제공합니다.",
        "difficulty": 2,
        "certInfo": "AWS Certified Solutions Architect Associate (SAA-C03)는 AWS에서 확장 가능하고 안정적인 시스템을 설계하는 능력을 검증합니다."
      },
      {
        "question": "ELB의 종류가 아닌 것은?",
        "options": [
          "Application Load Balancer",
          "Network Load Balancer",
          "Classic Load Balancer",
          "Database Load Balancer"
        ],
        "correct": 3,
        "explanation": "Database Load Balancer는 존재하지 않습니다.",
        "difficulty": 2,
        "certInfo": "ELB는 트래픽을 여러 대상에 자동으로 분산하여 애플리케이션의 가용성을 높입니다."
      }
    ],
    "cp": [
      {
        "question": "AWS 클라우드의 6가지 장점 중 하나가 아닌 것은?",
        "options": [
          "민첩성 향상",
          "비용 절감",
          "데이터 소유권 보장",
          "글로벌 확장"
        ],
        "correct": 2,
        "explanation": "AWS는 데이터 소유권을 보장하지 않습니다. 고객이 데이터를 소유합니다.",
        "difficulty": 1,
        "certInfo": "AWS Certified Cloud Practitioner (CLF-C01)는 AWS 클라우드의 기본 개념과 서비스를 이해하는 입문 자격증입니다."
      },
      {
        "question": "S3 버킷 이름의 특징은?",
        "options": [
          "리전별로 고유",
          "계정별로 고유",
          "전 세계적으로 고유",
          "AZ별로 고유"
        ],
        "correct": 2,
        "explanation": "S3 버킷 이름은 전 세계적으로 고유해야 합니다.",
        "difficulty": 1,
        "certInfo": "S3는 AWS의 핵심 스토리지 서비스로, 99.999999999%(11 9's)의 내구성을 제공합니다."
      },
      {
        "question": "EC2 인스턴스의 기본 모니터링 간격은?",
        "options": [
          "1분",
          "5분",
          "10분",
          "15분"
        ],
        "correct": 1,
        "explanation": "EC2 기본 모니터링은 5분 간격으로 수행됩니다.",
        "difficulty": 1,
        "certInfo": "EC2는 AWS의 가상 서버 서비스로, 다양한 인스턴스 타입과 운영체제를 지원합니다."
      }
    ],
    "dva": [
      {
        "question": "Lambda 함수의 최대 메모리 할당량은?",
        "options": [
          "1GB",
          "3GB",
          "10GB",
          "무제한"
        ],
        "correct": 2,
        "explanation": "Lambda 함수는 최대 10GB까지 메모리를 할당할 수 있습니다.",
        "difficulty": 3,
        "certInfo": "AWS Certified Developer Associate (DVA-C01)는 AWS 서비스를 사용한 애플리케이션 개발 및 배포 능력을 검증합니다."
      },
      {
        "question": "DynamoDB의 주요 특징은?",
        "options": [
          "관계형 데이터베이스",
          "NoSQL 데이터베이스",
          "인메모리 데이터베이스",
          "그래프 데이터베이스"
        ],
        "correct": 1,
        "explanation": "DynamoDB는 완전 관리형 NoSQL 데이터베이스입니다.",
        "difficulty": 3,
        "certInfo": "DynamoDB는 한 자릿수 밀리초 성능을 제공하는 완전 관리형 NoSQL 데이터베이스입니다."
      }
    ],
    "sap": [
      {
        "question": "AWS Organizations의 주요 기능은?",
        "options": [
          "비용 관리",
          "계정 통합 관리",
          "보안 강화",
          "성능 최적화"
        ],
        "correct": 1,
        "explanation": "AWS Organizations는 여러 AWS 계정을 중앙에서 관리할 수 있게 해줍니다.",
        "difficulty": 4,
        "certInfo": "AWS Certified Solutions Architect Professional (SAP-C01)는 복잡한 엔터프라이즈 아키텍처 설계 및 구현 능력을 검증하는 고급 자격증입니다."
      },
      {
        "question": "AWS Control Tower의 목적은?",
        "options": [
          "멀티 계정 환경 설정",
          "비용 최적화",
          "보안 감사",
          "성능 모니터링"
        ],
        "correct": 0,
        "explanation": "Control Tower는 안전하고 규정을 준수하는 멀티 계정 환경을 설정합니다.",
        "difficulty": 4,
        "certInfo": "AWS Control Tower는 멀티 계정 AWS 환경을 설정하고 관리하는 서비스입니다."
      }
    ]
  },
  "maps": {
    "nodeul-island": {
      "name": "노들섬",
      "width": 80,
      "height": 60,
      "tileSize": 16,
      "zones": [
        {
          "name": "초보자 구역",
          "bounds": {
            "x": 0,
            "y": 15,
            "width": 25,
            "height": 30
          },
          "description": "기본 AWS 서비스 (S3, EC2)",
          "difficulty": 1,
          "bgTile": 1
        },
        {
          "name": "중급자 숲",
          "bounds": {
            "x": 25,
            "y": 15,
            "width": 25,
            "height": 30
          },
          "description": "네트워킹 서비스 (VPC, ELB)",
          "difficulty": 2,
          "bgTile": 15
        },
        {
          "name": "고급자 산",
          "bounds": {
            "x": 50,
            "y": 15,
            "width": 30,
            "height": 30
          },
          "description": "고급 서비스 (Kubernetes, DevOps)",
          "difficulty": 3,
          "bgTile": 16
        }
      ],
      "rivers": [
        {
          "type": "curved",
          "startY": 8,
          "amplitude": 3,
          "frequency": 1.5,
          "width": 7
        },
        {
          "type": "curved",
          "startY": 48,
          "amplitude": 2,
          "frequency": 1.8,
          "width": 5
        }
      ],
      "buildings": [
        {
          "name": "AWS 교육센터",
          "x": 28,
          "y": 40,
          "width": 10,
          "height": 8,
          "type": 8,
          "collision": true
        },
        {
          "name": "노들섬 음악당",
          "x": 35,
          "y": 20,
          "width": 7,
          "height": 6,
          "type": 10,
          "collision": true
        }
      ],
      "roads": [
        {
          "type": "horizontal",
          "y": 30,
          "startX": 12,
          "endX": 68,
          "width": 2
        },
        {
          "type": "vertical",
          "x": 40,
          "startY": 18,
          "endY": 45,
          "width": 1
        }
      ]
    },
    "tiles": {
      "tiles": {
        "1": {
          "name": "잔디",
          "collision": false,
          "sprite": {
            "x": 20,
            "y": 48,
            "w": 16,
            "h": 16
          }
        },
        "2": {
          "name": "물",
          "collision": true,
          "animated": true
        },
        "3": {
          "name": "나무",
          "collision": true,
          "sprite": {
            "x": 0,
            "y": 48,
            "w": 16,
            "h": 16
          }
        },
        "7": {
          "name": "길",
          "collision": false,
          "sprite": {
            "x": 40,
            "y": 48,
            "w": 16,
            "h": 16
          }
        },
        "8": {
          "name": "AWS 센터",
          "collision": true,
          "sprite": {
            "x": 80,
            "y": 0,
            "w": 28,
            "h": 40
          }
        },
        "9": {
          "name": "집",
          "collision": true,
          "sprite": {
            "x": 40,
            "y": 0,
            "w": 24,
            "h": 40
          }
        },
        "10": {
          "name": "음악당",
          "collision": true,
          "sprite": {
            "x": 0,
            "y": 0,
            "w": 32,
            "h": 40
          }
        },
        "11": {
          "name": "CP 체육관",
          "collision": true,
          "color": "#2E7D32"
        },
        "12": {
          "name": "SAA 체육관",
          "collision": true,
          "color": "#1565C0"
        },
        "13": {
          "name": "DVA 체육관",
          "collision": true,
          "color": "#E65100"
        },
        "14": {
          "name": "SAP 체육관",
          "collision": true,
          "color": "#4A148C"
        },
        "15": {
          "name": "숲",
          "collision": false,
          "color": "#2E7D32"
        },
        "16": {
          "name": "산",
          "collision": false,
          "color": "#5D4037"
        },
        "17": {
          "name": "큰 나무",
          "collision": true,
          "color": "#228B22"
        },
        "18": {
          "name": "바위",
          "collision": true,
          "color": "#696969"
        }
      },
      "animations": {
        "water": {
          "frames": 4,
          "speed": 0.1,
          "colors": [
            "#4682B4",
            "#5F9EA0",
            "#6495ED",
            "#87CEEB"
          ]
        }
      }
    }
  },
  "version": 1757133347899,
  "timestamp": "2025-09-06T13:35:47.899890"
};

export default GAME_DATA;
