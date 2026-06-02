import os
import pickle
import re
from pathlib import Path

import numpy as np
from tensorflow.keras import backend as K
from tensorflow.keras.layers import Layer
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.sequence import pad_sequences

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

BASE_DIR = Path(__file__).resolve().parent
SENTIMENT_MODEL_PATH = BASE_DIR / "model_1.h5"
SARCASM_MODEL_PATH = BASE_DIR / "new_model_sarcasm.h5"
TOKENIZER_PATH = BASE_DIR / "tokenizer.pkl"
LABEL_MAPPING = {"positive": 1, "negative": 0, "neutral": 2}


class AttentionLayer(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            shape=(input_shape[-1], input_shape[-1]),
            initializer="glorot_uniform",
            trainable=True,
        )
        self.b = self.add_weight(
            shape=(input_shape[-1],),
            initializer="zeros",
            trainable=True,
        )
        self.u = self.add_weight(
            shape=(input_shape[-1], 1),
            initializer="glorot_uniform",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        u_it = K.tanh(K.dot(inputs, self.W) + self.b)
        ait = K.softmax(K.dot(u_it, self.u), axis=1)
        return K.sum(inputs * ait, axis=1)


model_sentiment = load_model(
    SENTIMENT_MODEL_PATH,
    custom_objects={"AttentionLayer": AttentionLayer},
)
model_sentiment.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model_sarcasm = load_model(SARCASM_MODEL_PATH)
model_sarcasm.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="binary_crossentropy",
    metrics=["accuracy"],
)

with TOKENIZER_PATH.open("rb") as file:
    tokenizer = pickle.load(file)


def remove_links(text):
    url_pattern = r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
    return re.sub(url_pattern, "", text)


def remove_non_alpha(text):
    return re.sub(r"[^a-zA-Z\s]", "", text).lower().strip()


def preprocess_sentence(sentence):
    sentence = remove_links(sentence)
    sentence = remove_non_alpha(sentence)
    sequence = tokenizer.texts_to_sequences([sentence])
    return pad_sequences(sequence, maxlen=32, padding="post", truncating="post")


def predict_sentiment(sentence):
    processed_sentence = preprocess_sentence(sentence)
    prediction = model_sentiment.predict(processed_sentence, verbose=0)
    predicted_class = int(np.argmax(prediction, axis=-1)[0])
    polarity = float(np.max(prediction[0]))

    if predicted_class == 0:
        polarity *= -1
    elif predicted_class == 2:
        polarity /= 10

    labels_by_index = {value: key for key, value in LABEL_MAPPING.items()}
    return [labels_by_index[predicted_class], polarity]


def predict_sarcasm(sentences):
    cleaned_sentences = [remove_non_alpha(remove_links(sentence)) for sentence in sentences]
    sequences = tokenizer.texts_to_sequences(cleaned_sentences)
    padded = pad_sequences(sequences, maxlen=32, padding="post", truncating="post")
    return model_sarcasm.predict(padded, verbose=0)


def predict_sentiment_f(sentence):
    sentiment, rating = predict_sentiment(sentence)
    sarcasm_score = float(predict_sarcasm([sentence])[0][0])

    if sarcasm_score < 0.99:
        return [sentiment, rating]

    if sentiment == "positive":
        sentiment = "negative"
    elif sentiment == "negative":
        sentiment = "positive"

    return [sentiment, -rating]
