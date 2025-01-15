#!/usr/bin/env python
# coding: utf-8

# In[8]:


# Importing Libraries
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Flatten, GRU, Bidirectional, Input
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Layer
from tensorflow.keras.models import Model
from tensorflow.keras import backend as K
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


# In[9]:


# Defining Attention Layer
class AttentionLayer(Layer):
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(shape=(input_shape[-1], input_shape[-1]),
                                 initializer='glorot_uniform',
                                 trainable=True)
        self.b = self.add_weight(shape=(input_shape[-1],),
                                 initializer='zeros',
                                 trainable=True)
        self.u = self.add_weight(shape=(input_shape[-1], 1),
                                 initializer='glorot_uniform',
                                 trainable=True)
        super(AttentionLayer, self).build(input_shape)

    def call(self, inputs):
        # Score computation
        u_it = K.tanh(K.dot(inputs, self.W) + self.b)
        ait = K.softmax(K.dot(u_it, self.u), axis=1)
        # Weighted sum of input vectors
        output = inputs * ait
        return K.sum(output, axis=1)


# In[10]:


from tensorflow.keras.models import load_model

# Load the senti ment analysis model, specifying the custom layer
model_sentiment = load_model('model_1.h5', custom_objects={'AttentionLayer': AttentionLayer})
# model_sentiment = load_model('final_model.h5', custom_objects={'AttentionLayer': AttentionLayer})
model_sentiment.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])


# In[11]:


from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
model_sarcasm = load_model('new_model_sarcasm.h5')
model_sarcasm.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])


# In[12]:


import pickle

# Load the tokenizer
with open('tokenizer.pkl', 'rb') as file:
    tokenizer = pickle.load(file)


# In[13]:


# Defining PreProcessing Functions
import re
def remove_links(text):
    # Regular expression to find URLs
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.sub(url_pattern, '', text)

def remove_non_alpha(text):
    ## Remove non-alphabetic characters and convert to lowercase
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower().strip()
    return text

def strip_whitespaces(text):
    return text.strip()  # Remove leading and trailing whitespaces


# In[14]:


# Predicting Sentiment
def preprocess_sentence(sentence):
    sentence = remove_links(sentence)
    sentence = remove_non_alpha(sentence)
    sentence = strip_whitespaces(sentence)
    sequence = tokenizer.texts_to_sequences([sentence])
    padded_sequence = pad_sequences(sequence, maxlen=32, padding='post', truncating='post')
    return padded_sequence

# def predict_sentiment(sentence, label_mapping):
#     # Preprocess the sentence
#     processed_sentence = preprocess_sentence(sentence)
#     # Get the model's prediction
#     prediction = model_sentiment.predict(processed_sentence)
#     # Get the index of the max prediction score
#     predicted_class = np.argmax(prediction, axis=-1)[0]
#     # Map the index back to the label
#     sentiment = {v: k for k, v in label_mapping.items()}[predicted_class]
#     return sentiment

def predict_sentiment(sentence, label_mapping):
    # Preprocess the sentence
    processed_sentence = preprocess_sentence(sentence)
    # Get the model's prediction
    prediction = model_sentiment.predict(processed_sentence)
    # Get the index of the max prediction score
    predicted_class = np.argmax(prediction, axis=-1)[0]
    # Obtaining Polarity
    polarity = max(list(prediction[0]))
    # For Negative Class
    if predicted_class==0: polarity *= (-1)
    # For Neutral Class
    if predicted_class==2: polarity /=10
    # Map the index back to the label
    sentiment = {v: k for k, v in label_mapping.items()}[predicted_class]
    return [sentiment,polarity]

# Example Usage
sentence = "this video is fantastic and enjoyable"
label_mapping = {"positive": 1, "negative": 0, "neutral": 2}  # Same as training
sentiment = predict_sentiment(sentence, label_mapping)


# In[15]:


def predict_sarcasm(sentences):
    # Preprocess and tokenize the input sentences
    sentences = [remove_links(sentence) for sentence in sentences]
    sentences = [remove_non_alpha(sentence) for sentence in sentences]
    sequences = tokenizer.texts_to_sequences(sentences)
    padded = pad_sequences(sequences, maxlen=32, padding='post', truncating='post')

    # Predicting sarcasm
    predictions = model_sarcasm.predict(padded)
    return predictions

# Example usage
new_sentences = ["this video is fantastic and enjoyable", "Oh fanastic another Monday doing this. Just what I wanted to do"]
predictions = predict_sarcasm(new_sentences)
print(predictions)


# In[16]:


# def predict_sentiment_f(sentence):
#   sentiment = predict_sentiment(sentence, label_mapping)
#   predictions = predict_sarcasm([sentence])[0]
#   print(sentiment,predictions)
#   if predictions<0.9: return sentiment
#   else:
#     if sentiment=="negative": return "positive"
#     else: return "negative"
#   print(sentiment,predictions)

def predict_sentiment_f(sentence):
  sentiment = predict_sentiment(sentence, label_mapping)
  predictions = predict_sarcasm([sentence])
  print(predictions)
  if predictions<0.99: return [sentiment[0],sentiment[1]]
  else: 
    if(sentiment[0]=='positive'):
        sentiment[0]='negative'
    elif(sentiment[0]=='negative'):
        sentiment[0]='positive'
    return [sentiment[0],(-1)*sentiment[1]]

# In[17]:


predict_sentiment_f("Oh great another upload")

