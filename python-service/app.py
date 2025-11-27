from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import re

app = FastAPI(title="Issue Classification Service", version="1.0.0")

class ClassificationRequest(BaseModel):
    title: str
    description: str = ""

class ClassificationResponse(BaseModel):
    tags: List[str]

class IssueClassifier:
    def __init__(self):
        self.classification_rules = [
            {
                "keywords": ["auth", "login", "token", "password", "credential", "session"],
                "tag": "security",
                "priority": 1
            },
            {
                "keywords": ["bug", "error", "crash", "exception", "fail", "broken"],
                "tag": "bug",
                "priority": 2
            },
            {
                "keywords": ["feature", "enhancement", "improve", "add", "new"],
                "tag": "enhancement",
                "priority": 3
            },
            {
                "keywords": ["ui", "interface", "design", "frontend", "css", "responsive"],
                "tag": "ui",
                "priority": 4
            },
            {
                "keywords": ["api", "backend", "server", "database", "endpoint"],
                "tag": "backend",
                "priority": 5
            },
            {
                "keywords": ["performance", "slow", "optimize", "speed", "latency"],
                "tag": "performance",
                "priority": 6
            },
            {
                "keywords": ["test", "testing", "unit", "integration", "coverage"],
                "tag": "testing",
                "priority": 7
            },
            {
                "keywords": ["documentation", "docs", "readme", "guide", "manual"],
                "tag": "documentation",
                "priority": 8
            },
            {
                "keywords": ["deployment", "deploy", "production", "staging", "ci/cd"],
                "tag": "deployment",
                "priority": 9
            },
            {
                "keywords": ["urgent", "critical", "blocker", "hotfix"],
                "tag": "urgent",
                "priority": 10
            }
        ]

    def classify(self, title: str, description: str) -> List[str]:
        text = f"{title} {description}".lower()
        found_tags = []
        
        for rule in self.classification_rules:
            for keyword in rule["keywords"]:
                if keyword.lower() in text:
                    if rule["tag"] not in found_tags:
                        found_tags.append(rule["tag"])
                    break
        
        if not found_tags:
            found_tags.append("general")
        
        return found_tags

classifier = IssueClassifier()

@app.get("/")
async def root():
    return {
        "service": "Issue Classification Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "issue-classifier"}

@app.post("/classify", response_model=ClassificationResponse)
async def classify_issue(request: ClassificationRequest):
    try:
        tags = classifier.classify(request.title, request.description)
        return ClassificationResponse(tags=tags)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

@app.get("/rules")
async def get_classification_rules():
    rules_info = []
    for rule in classifier.classification_rules:
        rules_info.append({
            "tag": rule["tag"],
            "keywords": rule["keywords"]
        })
    return {"rules": rules_info}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
