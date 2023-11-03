import json
from types import SimpleNamespace
import pandas as pd
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import sys


jsonColunas = sys.argv[1]
nomeTemplate = sys.argv[2]
tipoTemplate = sys.argv[3]

df = pd.DataFrame()

colunas = json.loads(jsonColunas, object_hook=lambda d: SimpleNamespace(**d))

nomeArquivo = nomeTemplate + '.' + tipoTemplate

for coluna in colunas:
    switch_dict = {
        'Texto': 'string',
        'Número': 'int32',
        'Moeda': 'float32',
        'Porcentagem': 'int32',
    }
    
    tipo = switch_dict.get(coluna.tipo, 'string')
        
    df[coluna.nome] = None
    df[coluna.nome].astype(tipo)
    
    if(tipoTemplate == 'csv'):
        df.to_csv(nomeArquivo, index=False)
    else: 
        #xlsx ou xls (ainda preciso saber como faz pro xls)
        writer = pd.ExcelWriter(nomeArquivo, engine="auto")
        df.to_excel(writer, sheet_name="template", index=False) 
        writer._save()
        

    
gauth = GoogleAuth()
GoogleAuth.DEFAULT_SETTINGS['client_config_file'] = 'src/scripts/client_secrets.json'
gauth.LocalWebserverAuth()  
drive = GoogleDrive(gauth)

file_drive = drive.CreateFile({'title': nomeArquivo})

file_drive.SetContentFile(nomeArquivo)
file_drive.Upload()
    
file_url = file_drive['alternateLink']
    
print(file_url)



