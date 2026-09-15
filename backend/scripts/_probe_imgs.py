# -*- coding: utf-8 -*-
import io
import openpyxl

p = r'C:\Users\AngelCarlelo\Desktop\JOSE\Matriz_obras_ejecutadas y planificadas Valle de los Chillos fin(4)rv2ffff3RV 2026.xlsx'
wb = openpyxl.load_workbook(p, data_only=True)
ws = wb['OBRAS REALIZADAS']
imgs = [i for i in ws._images if i.anchor._from.col == 11 and i.anchor._from.row >= 8]
print('imgs col11:', len(imgs))
img = imgs[0]
print('ref type:', type(img.ref))
print('has getvalue:', hasattr(img.ref, 'getvalue'))
print('format:', getattr(img, 'format', None))
print('haspath:', getattr(img, 'path', None))
try:
    b = img.ref.getvalue()
    print('getvalue len:', len(b), b[:12])
except Exception as e:
    print('getvalue err:', e)
for attr in ['_data', 'data', 'blob', 'bytes']:
    print(attr, hasattr(img, attr))
wb.close()
