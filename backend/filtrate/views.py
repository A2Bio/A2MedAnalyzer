import pandas as pd
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import StringIO

@csrf_exempt
def filtrate(request):
    if request.method == 'POST' and request.FILES.get('file'):
        try:
            tsv_file = request.FILES['file']
            excel_data = pd.read_csv(tsv_file, sep='\t')
            required_columns = ['mappedGenes', 'pValue', 'riskAllele', 'riskFrequency']
            if not all(col in excel_data.columns for col in required_columns):
                return JsonResponse({
                    'status': 'error',
                    'message': 'TSV-файл должен содержать столбцы: ' + ', '.join(required_columns),
                }, status=400)

            excel_data['mappedGenes'] = excel_data['mappedGenes'].str.split(',').str[0]
            counted_genes = excel_data.groupby('mappedGenes').size().reset_index(name='Count_Genes')
            filtered_data = excel_data[(excel_data['pValue'] <= 5 * 10**(-8)) & (excel_data['riskFrequency'] != "NR")]
            filtered_data['riskFrequency'] = pd.to_numeric(filtered_data['riskFrequency'], errors='coerce').round(3)
            counted_alleles = filtered_data.groupby('riskAllele').size().reset_index(name='Count_Alleles')
            filtered_data = filtered_data.drop_duplicates(subset=['riskAllele'])
            final_data = (filtered_data
                          .merge(counted_genes, on='mappedGenes', how='left')
                          .merge(counted_alleles, on='riskAllele', how='left')
                          .sort_values(by=['Count_Genes', 'mappedGenes'], ascending=[False, True]))

            table_columns = ['mappedGenes', 'riskAllele', 'riskFrequency', 'Count_Genes', 'Count_Alleles']
            table_data = final_data[table_columns].replace({np.nan: None}).to_dict(orient='records')

            genes_to_save = final_data[['mappedGenes']].drop_duplicates()
            csv_buffer = StringIO()
            genes_to_save.to_csv(csv_buffer, index=False, quoting=1)
            csv_file_path = 'extracted_genes.csv'
            default_storage.save(csv_file_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))

            csv_url = request.build_absolute_uri(default_storage.url(csv_file_path))

            return JsonResponse({
                'status': 'success',
                'table_data': table_data,
                'csv_url': csv_url,
            })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e),
            }, status=400)

    return JsonResponse({
        'status': 'error',
        'message': 'Неверный запрос или файл не предоставлен',
    }, status=400)