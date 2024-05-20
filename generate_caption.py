
import torch
import requests
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from PIL import Image
from io import BytesIO
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import sys
import json


model_path = r"C:\Users\Daniel\Desktop\EXX (2)\EXX\IC"
model = VisionEncoderDecoderModel.from_pretrained(model_path)
feature_extractor = ViTImageProcessor.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 16
num_beams = 4
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}


def generateCaption(imageUrls):
    captions = {}
    for imageUrl in imageUrls:
        
        try:
            response = requests.get(imageUrl)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            pixel_values = feature_extractor(images=[image], return_tensors="pt").pixel_values.to(device)
            output_ids = model.generate(pixel_values, **gen_kwargs)
            caption = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0].strip()
            captions[imageUrl] = caption
        except Exception as e:
           pass
    return captions

if __name__ == "__main__":
    data = os.environ.get('IMAGE_URLS')
    imageUrls = json.loads(data)

    
    captions = generateCaption(imageUrls)
    

    json.dump(captions, sys.stdout) 