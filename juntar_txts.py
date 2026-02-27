#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para juntar múltiplos arquivos TXT em um único arquivo
Criado para Sandro Junior - Sensio
"""

import os
from pathlib import Path

def juntar_arquivos_txt(pasta_entrada, arquivo_saida="arquivo_completo.txt"):
    """
    Junta todos os arquivos .txt de uma pasta em um único arquivo
    
    Args:
        pasta_entrada: Caminho da pasta com os arquivos TXT
        arquivo_saida: Nome do arquivo final (padrão: arquivo_completo.txt)
    """
    
    # Lista todos os arquivos .txt da pasta
    arquivos_txt = list(Path(pasta_entrada).glob("*.txt"))
    
    if not arquivos_txt:
        print("❌ Nenhum arquivo .txt encontrado na pasta!")
        return
    
    print(f"📁 Encontrados {len(arquivos_txt)} arquivos TXT")
    print("🔄 Processando...\n")
    
    # Abre o arquivo de saída para escrita
    with open(arquivo_saida, 'w', encoding='utf-8') as saida:
        
        for i, arquivo in enumerate(arquivos_txt, 1):
            print(f"   [{i}/{len(arquivos_txt)}] Processando: {arquivo.name}")
            
            # Escreve o separador com o nome do arquivo
            separador = f"\n{'='*80}\n"
            separador += f"ARQUIVO: {arquivo.name}\n"
            separador += f"{'='*80}\n\n"
            saida.write(separador)
            
            # Lê e escreve o conteúdo do arquivo
            try:
                with open(arquivo, 'r', encoding='utf-8') as entrada:
                    conteudo = entrada.read()
                    saida.write(conteudo)
                    saida.write("\n\n")  # Adiciona espaço após cada arquivo
            except Exception as e:
                print(f"   ⚠️  Erro ao ler {arquivo.name}: {e}")
    
    print(f"\n✅ Concluído! Arquivo gerado: {arquivo_saida}")
    print(f"📊 Total de {len(arquivos_txt)} arquivos mesclados")


if __name__ == "__main__":
    print("="*80)
    print("JUNTAR ARQUIVOS TXT - Script v1.0")
    print("="*80)
    print()
    
    # Solicita o caminho da pasta
    pasta = input("📂 Cole o caminho da pasta com os arquivos TXT: ").strip()
    
    # Remove aspas se o usuário colar o caminho com aspas
    pasta = pasta.strip('"').strip("'")
    
    # Verifica se a pasta existe
    if not os.path.exists(pasta):
        print("❌ Pasta não encontrada! Verifique o caminho.")
        input("\nPressione ENTER para sair...")
        exit(1)
    
    # Nome do arquivo de saída (opcional)
    print()
    nome_saida = input("💾 Nome do arquivo final [ENTER = arquivo_completo.txt]: ").strip()
    if not nome_saida:
        nome_saida = "arquivo_completo.txt"
    
    # Garante extensão .txt
    if not nome_saida.endswith('.txt'):
        nome_saida += '.txt'
    
    print()
    
    # Executa a junção
    juntar_arquivos_txt(pasta, nome_saida)
    
    print()
    input("Pressione ENTER para sair...")
