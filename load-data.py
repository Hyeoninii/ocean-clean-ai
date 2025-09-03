#!/usr/bin/env python3
"""
데이터 로딩을 위한 Python 스크립트
CSV 파일들을 읽어서 데이터베이스에 삽입하는 데모용 스크립트
"""

import csv
import os
import json

def load_csv_data():
    """CSV 파일들을 읽어서 JSON 형태로 변환"""
    
    data_files = [
        "backend/data/csv/ocean_risk.csv",
        "backend/data/csv/test.csv", 
        "backend/data/csv/image_data.csv"
    ]
    
    all_data = []
    
    for file_path in data_files:
        if not os.path.exists(file_path):
            print(f"파일이 존재하지 않습니다: {file_path}")
            continue
            
        print(f"로딩 중: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                if file_path.endswith("image_data.csv"):
                    # image_data.csv 형식
                    data = {
                        "fileName": row["filename"],
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "label": row["object_type"],
                        "weight": float(row["confidence"]),
                        "cluster": 1,
                        "riskScore": float(row["risk_score"]),
                        "imagePath": f"data/images/{row['filename']}"
                    }
                else:
                    # ocean_risk.csv, test.csv 형식
                    data = {
                        "fileName": row["File"].replace('"', ''),
                        "latitude": float(row["Latitude"]),
                        "longitude": float(row["Longitude"]),
                        "label": row["Label"].replace('"', ''),
                        "weight": float(row["Weight"]),
                        "cluster": int(row["Cluster"]),
                        "riskScore": float(row["RiskScore"]),
                        "imagePath": f"data/images/{row['File'].replace('.json', '.jpg').replace('\"', '')}"
                    }
                
                all_data.append(data)
    
    print(f"총 {len(all_data)}개의 데이터를 로드했습니다.")
    
    # JSON 파일로 저장 (백엔드에서 읽을 수 있도록)
    with open("backend/data/loaded_data.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print("데이터가 backend/data/loaded_data.json에 저장되었습니다.")
    
    return all_data

if __name__ == "__main__":
    load_csv_data()
