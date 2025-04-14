import json, re, string, contractions, random
import pandas as pd
import numpy as np
from collections import Counter
from bs4 import BeautifulSoup
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from sklearn.preprocessing import LabelEncoder
from autocorrect import Speller
from keras.utils import to_categorical

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

class ConversationDataProcessor:
    def __init__(self, file_path='database.json'):
        self.file_path = file_path
        self.data = None
        self.df = None
        self.lemmatizer = WordNetLemmatizer()
        self.spell = Speller(lang='en')

    def load_data(self):
        with open(self.file_path, 'r') as f:
            self.data = json.load(f)        
    
    def get_intent(self):
        if self.data is None:
            self.load_data()        
        return self.data

    def process_conversations(self):
        if self.data is None:
            self.load_data()
        conversation_pairs = []
        for conversation in self.data.get('conversations', []):
            context = conversation['context']
            for prompt in conversation.get('prompt', []):
                conversation_pairs.append((prompt, context))
        return conversation_pairs

    def process_text(self, text):
        text = BeautifulSoup(text, "html.parser").get_text()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = text.translate(str.maketrans('', '', string.punctuation)) 
        text = contractions.fix(text)
        word_list = word_tokenize(text.lower())
        cleaned_words = []
        for token in word_list:
            token = self.spell(token)
            noun_lemma = self.lemmatizer.lemmatize(token)
            verb_lemma = self.lemmatizer.lemmatize(token, pos='v')
            lemma = min([noun_lemma, verb_lemma], key=len)
            cleaned_words.append(lemma)
        return ' '.join(cleaned_words)

    def create_dataframe(self):
        conversation_pairs = self.process_conversations()
        self.df = pd.DataFrame(conversation_pairs, columns=['prompt', 'context'])
        pd.set_option('display.max_columns', None)
        pd.set_option('display.max_rows', None)
        pd.set_option('display.max_colwidth', None)
        self.df['prompt'] = self.df['prompt'].apply(self.process_text)
        return self.df

    def get_dataframe(self):
        if self.df is None:
            return self.create_dataframe()
        return self.df

class Tokenizer:
    def __init__(self, vocab_size=10000):
        self.vocab_size = vocab_size
        self.word2idx = {}
        self.idx2word = {}
        self.special_tokens = {
            '<PAD>': 0,  
            '<BOS>': 1,  
            '<EOS>': 2,  
            '<UNK>': 3  
        }
        self.vocab = None
        self.label_encoder = LabelEncoder()
        
    def build_vocab_context(self, df):
        prompts = df['prompt']
        contexts = df['context']        
        word_counts = Counter()        
        for prompt in prompts:
            words = prompt.split() if isinstance(prompt, str) else prompt
            word_counts.update(words)        
        most_common = word_counts.most_common(self.vocab_size - len(self.special_tokens))        
        self.vocab = list(self.special_tokens.keys()) + [word for word, _ in most_common]  
        
        self.word2idx = {word: idx for idx, word in enumerate(self.vocab)}
        self.idx2word = {idx: word for idx, word in enumerate(self.vocab)}   
        
        y_encoded = self.label_encoder.fit_transform(contexts)       
        self.context_to_encoded = {
            context: int(encoded) 
            for context, encoded in zip(contexts, y_encoded)
        }        
        self.encoded_to_context = {
            int(encoded): context 
            for context, encoded in zip(contexts, y_encoded)
        }

    def get_vocab(self):
        return self.vocab

    def get_index_word(self):
        return self.idx2word
    
    def get_context(self):
        return self.encoded_to_context

    def tokenize(self, prompt, add_bos=True, add_eos=True):
        words = prompt.split() if isinstance(prompt, str) else prompt        
        tokens = []
        if add_bos:
            tokens.append(self.word2idx['<BOS>'])            
        for word in words:
            tokens.append(self.word2idx.get(word, self.word2idx['<UNK>']))            
        if add_eos:
            tokens.append(self.word2idx['<EOS>'])            
        return tokens
    
    def detokenize(self, tokens, remove_special=True):
        words = []
        for token in tokens:
            word = self.idx2word.get(token, '<UNK>')
            if remove_special and word in self.special_tokens:
                continue
            words.append(word)
        return ' '.join(words)
    
    def pad_sequence(self, tokens, max_length):
        if len(tokens) >= max_length:
            return tokens[:max_length]
        return tokens + [self.word2idx['<PAD>']] * (max_length - len(tokens))     

    def word_tokenize(self, tokens):
        word_index = {word: idx+1 for idx, word in enumerate(self.vocab)}
        return [word_index[token] if token in tokens else 0 for token in self.vocab]
    
    def pad_array(self, pad):
        padded = np.array([pad]) 
        return padded
            
    def save_vocab_context(self):
        for filename, data in [('vocab.json', self.word2idx), 
                               ('context.json', self.context_to_encoded)]:
            with open(filename, 'w') as f:
                json.dump(data, f, indent=4)

class DatasetBuilder:
    def __init__(self, tokenizer, max_length=25):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.le = LabelEncoder()
    
    def build_dataset(self, df, method):
        if method == 1:
            df['prompt'] = df['prompt'].apply(
                lambda x: self.tokenizer.pad_sequence(
                    self.tokenizer.tokenize(x),
                    max_length=self.max_length
                ))
        else:
            df['prompt'] = df['prompt'].apply(
                lambda x: self.tokenizer.word_tokenize(x))
        return df    
    
    def create_final_dataframe(self, df, method = 1):        
        df = self.build_dataset(df, method)    
        first_prompt = df['prompt'].iloc[0]
        length = len(first_prompt) 
        prompt_df = pd.DataFrame(df['prompt'].tolist(), 
                                columns=[f'X{i}' for i in range(length)])        
        y = self.le.fit_transform(df['context'])        
        final_df = pd.concat([prompt_df, pd.Series(y, name='y')], axis=1)        
        return final_df

class BuildTraining:
    def __init__(self, data, random_state=None):
        self.data = data
        self.random_state = random_state
        self.X = None
        self.y = None
        self.XDim = None
        self.yDim = None
        
    def preprocess(self):
        if self.random_state is not None:
            self.data = self.data.sample(frac=1, random_state=self.random_state).reset_index(drop=True)
        self.X = self.data.drop(columns=['y'])
        self.y = self.data['y']
        self.XDim = self.X.shape[1]
        self.yDim = len(self.y.unique()) 
        self.y_onehot = to_categorical(self.y, num_classes=self.yDim)       
        return self.X, self.y_onehot, self.XDim, self.yDim
    
    def get_feature_names(self):
        return list(self.X.columns)
    
    def get_target_name(self):
        return 'y'
    
class DenoisingChatbotModel:
    def __init__(self, input_dim, output_dim, learning_rate=0.001):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.learning_rate = learning_rate
        self.model = self.build_model()
        
    def build_model(self):
        model = Sequential()
        model.add(Dense(256, input_shape=(self.input_dim,), activation='relu'))
        model.add(Dropout(0.5))
        model.add(Dense(128, activation='relu'))
        model.add(Dropout(0.5))
        model.add(Dense(64, activation='relu'))
        model.add(Dropout(0.5))
        model.add(Dense(self.output_dim, activation='softmax'))
        
        optimizer = Adam(learning_rate=self.learning_rate)
        model.compile(loss='categorical_crossentropy', 
                      optimizer=optimizer, 
                      metrics=['accuracy'])
        return model
    
    def train(self, X, y, epochs=1000, batch_size=16, verbose=1):
        history = self.model.fit(X, y, 
                               epochs=epochs, 
                               batch_size=batch_size, 
                               verbose=verbose)
        return history
    
    def save(self, filepath='neoden_chatbot.h5'):
        self.model.save(filepath)
        print(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath, input_dim=None, output_dim=None, learning_rate=0.001):
        try:
            loaded_model = load_model(filepath)
            print(f"Model loaded from {filepath}")
            if input_dim is None:
                input_dim = loaded_model.layers[0].input_shape[1]
            if output_dim is None:
                output_dim = loaded_model.layers[-1].output_shape[1]
            instance = cls(input_dim, output_dim, learning_rate)
            instance.model = loaded_model
            return instance
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
        
    def get_model(self, filepath='neoden_chatbot.h5'):
        loaded_model = load_model(filepath)
        return loaded_model
    
class ChatBot:
    def __init__(self, model, context, database, tokenizer, dataprocessor, XDim, rth=0.7):
        self.model = model
        self.context = context
        self.database = database
        self.tokenizer = tokenizer
        self.dataprocessor = dataprocessor
        self.XDim = XDim
        self.spell = Speller(lang='en')
        self.ERROR_THRESHOLD = rth   

    def predict_class(self, bow):
        try:
            res = self.model.predict(bow)[0]
            print(res)
            results = [[i, r] for i, r in enumerate(res) if r > self.ERROR_THRESHOLD]
            print(results)
            results.sort(key=lambda x: x[1], reverse=True)
            print(results)
            return [{'conversation': self.context[r[0]], 'probability': str(r[1])} for r in results]
        except Exception as e:
            print(f"Prediction error: {e}")
            return []

    def get_response(self, neoden_list):
        print(neoden_list)
        if not neoden_list:
            return "Sorry, I didn't understand that."            
        tag = neoden_list[0]['conversation']
        print(tag)
        for intent in self.database.get('conversations', []):
            if intent['context'] == tag:
                return random.choice(intent['response'])
        return "I'm not sure how to respond to that."

    def process_message(self, message):
        try:
            if not message.strip():
                raise ValueError("Empty input provided")
            message = self.spell(message)
            text = self.dataprocessor.process_text(message)
            tokens = self.tokenizer.tokenize(text)
            padded = self.tokenizer.pad_sequence(tokens, max_length=self.XDim)  
            padded = self.tokenizer.pad_array(padded)
            predictions = self.predict_class(padded)
            return self.get_response(predictions)
            
        except Exception as e:
            print(f"Message processing error: {e}")
            return "An error occurred while processing your message."

    def chat(self, message):                                   
        response = self.process_message(message)
        return response           



