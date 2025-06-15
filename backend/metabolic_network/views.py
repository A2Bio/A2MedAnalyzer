import pandas as pd
import gseapy as gp
import networkx as nx
import plotly.graph_objects as go
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import StringIO
import uuid
import logging
import glob

logger = logging.getLogger(__name__)

@csrf_exempt
def metabolic_network(request):
    if request.method == 'POST' and request.FILES.get('file'):
        try:
            # Загрузка CSV
            csv_file = request.FILES['file']
            
            # Чтение CSV
            try:
                gene_table = pd.read_csv(csv_file, sep=',')
            except:
                csv_file.seek(0)
                gene_table = pd.read_csv(csv_file, sep='\t')

            if 'mappedGenes' not in gene_table.columns:
                return JsonResponse({
                    'status': 'error',
                    'message': 'CSV must contain a column called "mappedGenes"'
                }, status=400)

            # Извлечение списка генов
            gene_list = gene_table['mappedGenes'].dropna().tolist()
            if not gene_list:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Gene list is empty'
                }, status=400)

            # Анализ KEGG с gseapy.enrichr
            kegg_results = gp.enrichr(
                gene_list=gene_list,
                gene_sets='KEGG_2019_Human',
                organism='Human',
                outdir=None,
                no_plot=True
            )

            # Извлечение результатов
            enr_results = kegg_results.results
            if enr_results.empty:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No significant KEGG enrichment results'
                }, status=400)

            # Сопоставление foldChange из KEGG (используем Odds Ratio)
            fold_changes = {}
            for _, row in enr_results.iterrows():
                genes = row['Genes'].split(';')
                odds_ratio = row.get('Odds Ratio', 0.0)  # Используем Odds Ratio как foldChange
                for gene in genes:
                    if gene in gene_list:
                        fold_changes[gene] = odds_ratio

            # Построение метаболической сети
            G = nx.Graph()
            top_pathways = enr_results.head(10)  # 10 путей
            for _, row in top_pathways.iterrows():
                pathway = row['Term']
                genes = row['Genes'].split(';')
                size = min(len(genes), 5)  # Размер узла пути (2-5)
                G.add_node(pathway, type='pathway', size=size)
                for gene in genes:
                    if gene in gene_list:
                        fc = fold_changes.get(gene, 0.0)  # foldChange из KEGG
                        G.add_node(gene, type='gene', size=2, fold_change=fc)
                        G.add_edge(pathway, gene)

            # Визуализация с Plotly
            pos = nx.spring_layout(G, seed=42)
            edge_x, edge_y = [], []
            for edge in G.edges():
                x0, y0 = pos[edge[0]]
                x1, y1 = pos[edge[1]]
                edge_x.extend([x0, x1, None])
                edge_y.extend([y0, y1, None])

            edge_trace = go.Scatter(
                x=edge_x, y=edge_y,
                line=dict(width=1, color='#888'),
                hoverinfo='none',
                mode='lines'
            )

            node_x, node_y = [], []
            node_text, node_size, node_color = [], [], []
            for node in G.nodes():
                x, y = pos[node]
                node_x.append(x)
                node_y.append(y)
                node_text.append(node)
                node_size.append(G.nodes[node]['size'] * 10)  # Масштабируем для читаемости
                fc = G.nodes[node].get('fold_change', 0.0)
                node_color.append(fc)  # Цвет по foldChange из KEGG

            node_trace = go.Scatter(
                x=node_x, y=node_y,
                mode='markers+text',
                text=node_text,
                textposition='top center',
                hoverinfo='text',
                marker=dict(
                    size=node_size,
                    color=node_color,
                    colorscale='RdBu',  # Красный-синий градиент
                    cmin=-1.0, cmax=1.0,
                    colorbar=dict(title='fold change', tickvals=[-1.0, -0.5, 0.0, 0.5, 1.0]),
                    line_width=1
                )
            )

            fig = go.Figure(
                data=[edge_trace, node_trace],
                layout=go.Layout(
                    title='Metabolic Network from KEGG',
                    showlegend=False,
                    hovermode='closest',
                    xaxis=dict(showgrid=False, zeroline=True, showticklabels=False),
                    yaxis=dict(showgrid=False, zeroline=True, showticklabels=False)
                )
            )

            # Сохранение графика и удаление старого
            plot_uuid = uuid.uuid4().hex
            plot_path = f'metabolic_network_{plot_uuid}.html'
            for old_plot in glob.glob('metabolic_network_*.html'):
                default_storage.delete(old_plot)
                logger.info(f"Old file removed: {old_plot}")
            default_storage.save(plot_path, ContentFile(fig.to_html().encode('utf-8')))
            plot_url = request.build_absolute_uri(default_storage.url(plot_path))
            logger.info(f"Network saved: {plot_path}")

            # Сохранение данных сети как CSV и удаление старого
            edges_df = pd.DataFrame(G.edges(), columns=['Source', 'Target'])
            csv_buffer = StringIO()
            edges_df.to_csv(csv_buffer, index=False)
            csv_path = f'metabolic_network_edges_{plot_uuid}.csv'
            for old_csv in glob.glob('metabolic_network_edges_*.csv'):
                default_storage.delete(old_csv)
                logger.info(f"Old CSV removed: {old_csv}")
            default_storage.save(csv_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))
            csv_url = request.build_absolute_uri(default_storage.url(csv_path))
            logger.info(f"CSV saved: {csv_path}")

            return JsonResponse({
                'status': 'success',
                'message': 'Metabolic network created with foldChange from KEGG',
                'plot_url': plot_url,
                'csv_url': csv_url
            })

        except Exception as e:
            logger.error(f"Error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request or file not provided'
    }, status=400)
