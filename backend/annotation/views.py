import pandas as pd
import gseapy as gp
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from io import BytesIO
import os
import logging
import glob

logger = logging.getLogger(__name__)

@csrf_exempt
def annotate(request):
    if request.method == 'POST' and request.FILES.get('file'):
        try:
            # Загрузка CSV
            csv_file = request.FILES['file']
            if csv_file.size > 10 * 1024 * 1024:  # Ограничение 10 МБ
                return JsonResponse({
                    'status': 'error',
                    'message': 'Файл слишком большой. Максимум 10 МБ.'
                }, status=400)

            # Чтение CSV (пробуем запятую, затем точку с запятой)
            try:
                annotation_table = pd.read_csv(csv_file, sep=',')
            except:
                csv_file.seek(0)  # Сброс указателя файла
                annotation_table = pd.read_csv(csv_file, sep=';')

            # Проверка столбца
            if 'mappedGenes' not in annotation_table.columns:
                return JsonResponse({
                    'status': 'error',
                    'message': 'CSV должен содержать столбец "mappedGenes"'
                }, status=400)

            # Извлечение списка генов
            gene_list = annotation_table['mappedGenes'].dropna().tolist()
            if not gene_list:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Список генов пуст'
                }, status=400)

            # Удаление старых изображений
            for old_file in glob.glob(os.path.join(settings.MEDIA_ROOT, 'annotation_*.png')):
                default_storage.delete(old_file)
                logger.info(f"Удалён старый файл: {old_file}")

            # Выполнение GO-анализа
            go_results = gp.enrichr(
                gene_list=gene_list,
                gene_sets='GO_Biological_Process_2021',
                organism='Human',
                outdir=None
            )

            # Генерация изображения для GO
            plt.figure(figsize=(10, 6))
            sns.scatterplot(
                data=go_results.results.head(30),
                x='P-value',
                y='Term',
                size='Odds Ratio',
                sizes=(50, 500),
                hue='P-value',
                palette='viridis',
                legend=None,
                alpha=0.7
            )
            plt.title('GO Enrichment of All Genes')
            plt.xlabel('P-Value')
            plt.ylabel('Gene Ontology Term')
            plt.axvline(x=0.05, color='red', linestyle='--')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()

            # Сохранение GO-изображения
            go_buffer = BytesIO()
            plt.savefig(go_buffer, format='png', bbox_inches='tight')
            go_buffer.seek(0)
            go_image_path = 'annotation_go_enrichment_bubble.png'
            default_storage.save(go_image_path, ContentFile(go_buffer.getvalue()))
            go_buffer.close()
            plt.close()
            go_image_url = request.build_absolute_uri(default_storage.url(go_image_path))
            logger.info(f"GO-изображение сохранено: {go_image_path}")

            # Выполнение KEGG-анализа
            kegg_results = gp.enrichr(
                gene_list=gene_list,
                gene_sets='KEGG_2019_Human',
                organism='Human',
                outdir=None
            )

            # Генерация изображения для KEGG
            plt.figure(figsize=(10, 8))
            sns.scatterplot(
                data=kegg_results.results.head(40),
                x='P-value',
                y='Term',
                size='Odds Ratio',
                sizes=(50, 500),
                hue='P-value',
                palette='viridis',
                legend=None,
                alpha=0.7
            )
            plt.title('KEGG Enrichment of All Genes')
            plt.xlabel('P-Value')
            plt.ylabel('KEGG Pathway')
            plt.axvline(x=0.05, color='red', linestyle='--')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()

            # Сохранение KEGG-изображения
            kegg_buffer = BytesIO()
            plt.savefig(kegg_buffer, format='png', bbox_inches='tight')
            kegg_buffer.seek(0)
            kegg_image_path = 'annotation_kegg_enrichment_bubble.png'
            default_storage.save(kegg_image_path, ContentFile(kegg_buffer.getvalue()))
            kegg_buffer.close()
            plt.close()
            kegg_image_url = request.build_absolute_uri(default_storage.url(kegg_image_path))
            logger.info(f"KEGG-изображение сохранено: {kegg_image_path}")

            # Возврат URL изображений
            return JsonResponse({
                'status': 'success',
                'message': 'Анализ и генерация изображений завершены',
                'image_urls': [
                    {'name': 'go_enrichment_bubble.png', 'url': go_image_url},
                    {'name': 'kegg_enrichment_bubble.png', 'url': kegg_image_url}
                ]
            })

        except Exception as e:
            logger.error(f"Ошибка обработки CSV: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    return JsonResponse({
        'status': 'error',
        'message': 'Неверный запрос или файл не предоставлен'
    }, status=400)