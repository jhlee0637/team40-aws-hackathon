// AWS 자격증별 퀴즈 데이터베이스
const QUIZ_DATABASE = {
    cp: [
        {
            question: "AWS의 핵심 가치 제안은 무엇인가요?",
            options: ["비용 절감만", "확장성만", "보안만", "비용 절감, 확장성, 보안 모두"],
            correct: 3,
            explanation: "AWS는 비용 절감, 확장성, 보안을 모두 제공하는 클라우드 플랫폼입니다."
        },
        {
            question: "AWS의 글로벌 인프라는 무엇으로 구성되어 있나요?",
            options: ["리전과 가용 영역", "데이터센터만", "서버만", "네트워크만"],
            correct: 0,
            explanation: "AWS는 전 세계에 리전(Region)과 가용 영역(Availability Zone)으로 구성된 인프라를 운영합니다."
        }
    ],
    
    saa: [
        {
            question: "고가용성을 위해 EC2 인스턴스를 배치할 때 권장사항은?",
            options: ["단일 AZ에 배치", "여러 AZ에 배치", "단일 리전에만 배치", "온프레미스와 혼합"],
            correct: 1,
            explanation: "고가용성을 위해서는 여러 가용 영역(AZ)에 인스턴스를 분산 배치해야 합니다."
        },
        {
            question: "S3의 스토리지 클래스 중 가장 저렴한 것은?",
            options: ["Standard", "IA", "Glacier", "Deep Archive"],
            correct: 3,
            explanation: "S3 Glacier Deep Archive는 장기 보관용으로 가장 저렴한 스토리지 클래스입니다."
        }
    ],
    
    dva: [
        {
            question: "AWS Lambda의 최대 실행 시간은?",
            options: ["5분", "10분", "15분", "30분"],
            correct: 2,
            explanation: "AWS Lambda 함수의 최대 실행 시간은 15분입니다."
        },
        {
            question: "API Gateway에서 지원하는 인증 방식이 아닌 것은?",
            options: ["IAM", "Cognito", "Lambda Authorizer", "SSH Key"],
            correct: 3,
            explanation: "API Gateway는 IAM, Cognito, Lambda Authorizer를 지원하지만 SSH Key는 지원하지 않습니다."
        }
    ],
    
    soa: [
        {
            question: "CloudWatch에서 커스텀 메트릭을 생성하는 방법은?",
            options: ["자동 생성됨", "PutMetricData API 사용", "불가능", "EC2에서만 가능"],
            correct: 1,
            explanation: "CloudWatch에서는 PutMetricData API를 사용하여 커스텀 메트릭을 생성할 수 있습니다."
        },
        {
            question: "Auto Scaling 그룹의 최소 인스턴스 수를 0으로 설정할 수 있나요?",
            options: ["불가능", "가능", "특정 조건에서만", "리전에 따라 다름"],
            correct: 1,
            explanation: "Auto Scaling 그룹의 최소 인스턴스 수는 0으로 설정할 수 있습니다."
        }
    ],
    
    sap: [
        {
            question: "대규모 데이터 마이그레이션에 적합한 AWS 서비스는?",
            options: ["Direct Connect", "Snowball", "VPN", "Internet Gateway"],
            correct: 1,
            explanation: "AWS Snowball은 대용량 데이터를 안전하고 빠르게 마이그레이션할 수 있는 서비스입니다."
        }
    ],
    
    dop: [
        {
            question: "CodePipeline에서 지원하는 소스 제공자가 아닌 것은?",
            options: ["GitHub", "CodeCommit", "S3", "FTP"],
            correct: 3,
            explanation: "CodePipeline은 GitHub, CodeCommit, S3를 소스 제공자로 지원하지만 FTP는 지원하지 않습니다."
        }
    ]
};

// 랜덤 퀴즈 선택 함수
function getRandomQuiz(certType) {
    const quizzes = QUIZ_DATABASE[certType];
    if (!quizzes || quizzes.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    return quizzes[randomIndex];
}

// 자격증 정보
const CERT_INFO = {
    cp: {
        name: "Cloud Practitioner",
        description: "AWS 클라우드의 기본 개념과 서비스를 이해하는 입문 자격증",
        color: "#ff6b6b",
        difficulty: 1
    },
    saa: {
        name: "Solutions Architect Associate",
        description: "AWS에서 확장 가능하고 안전한 애플리케이션을 설계하는 자격증",
        color: "#4ecdc4",
        difficulty: 2
    },
    dva: {
        name: "Developer Associate",
        description: "AWS에서 애플리케이션을 개발하고 배포하는 자격증",
        color: "#45b7d1",
        difficulty: 2
    },
    soa: {
        name: "SysOps Administrator Associate",
        description: "AWS에서 시스템을 운영하고 관리하는 자격증",
        color: "#f9ca24",
        difficulty: 2
    },
    sap: {
        name: "Solutions Architect Professional",
        description: "복잡한 AWS 솔루션을 설계하는 고급 자격증",
        color: "#a55eea",
        difficulty: 3
    },
    dop: {
        name: "DevOps Engineer Professional",
        description: "AWS에서 DevOps 프로세스를 구현하는 고급 자격증",
        color: "#26de81",
        difficulty: 3
    }
};