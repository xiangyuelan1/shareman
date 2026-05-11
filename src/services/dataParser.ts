import type { Memory, DataFormat, ImportResult } from '@/types';

class DataFormatParser {
  parseJSON(content: string): { success: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(content);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '无效的JSON格式' };
    }
  }

  parseCSV(content: string): { success: boolean; headers?: string[]; rows?: string[][]; error?: string } {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, error: 'CSV至少需要表头和一行数据' };
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim())
      );
      
      return { success: true, headers, rows };
    } catch (error) {
      return { success: false, error: '无效的CSV格式' };
    }
  }

  parseMarkdown(content: string): { success: boolean; title?: string; sections?: Array<{heading: string; content: string}>; error?: string } {
    try {
      const lines = content.split('\n');
      const sections: Array<{heading: string; content: string}> = [];
      let currentHeading = '';
      let currentContent: string[] = [];
      
      for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          if (currentHeading || currentContent.length > 0) {
            sections.push({
              heading: currentHeading || 'Introduction',
              content: currentContent.join('\n').trim()
            });
          }
          currentHeading = headingMatch[2];
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      }
      
      if (currentContent.length > 0) {
        sections.push({
          heading: currentHeading || 'Content',
          content: currentContent.join('\n').trim()
        });
      }
      
      const title = sections[0]?.heading || 'Untitled';
      
      return { success: true, title, sections };
    } catch (error) {
      return { success: false, error: '无效的Markdown格式' };
    }
  }

  parseXML(content: string): { success: boolean; data?: any; error?: string } {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      const parseError = xmlDoc.querySelector('parsererror');
      
      if (parseError) {
        return { success: false, error: '无效的XML格式' };
      }
      
      const data = this.xmlToJson(xmlDoc.documentElement);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '无效的XML格式' };
    }
  }

  private xmlToJson(node: any): any {
    if (node.nodeType === 3) {
      return node.textContent.trim();
    }
    
    if (node.nodeType === 1) {
      const obj: any = {};
      
      if (node.attributes && node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes.item(i);
          if (attr) {
            obj['@attributes'][attr.nodeName] = attr.nodeValue;
          }
        }
      }
      
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes.item(i);
        const childName = child.nodeName;
        
        if (child.nodeType === 3 && !child.textContent?.trim()) {
          continue;
        }
        
        const childJson = this.xmlToJson(child);
        
        if (obj[childName]) {
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]];
          }
          obj[childName].push(childJson);
        } else {
          obj[childName] = childJson;
        }
      }
      
      return obj;
    }
    
    return null;
  }

  parseYAML(content: string): { success: boolean; data?: any; error?: string } {
    try {
      const lines = content.split('\n');
      const data: any = {};
      let currentKey = '';
      let currentArray: string[] = [];
      let inArray = false;
      
      for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        
        if (line.match(/^[^:]+:$/) && !line.includes('-')) {
          if (inArray && currentArray.length > 0) {
            data[currentKey] = currentArray;
            currentArray = [];
            inArray = false;
          }
          
          currentKey = line.replace(/:$/, '').trim();
          
          if (lines[lines.indexOf(line) + 1]?.match(/^\s+-\s+/)) {
            inArray = true;
            continue;
          }
        }
        
        if (inArray && line.match(/^\s+-\s+/)) {
          currentArray.push(line.replace(/^\s+-\s+/, '').trim());
        } else if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          if (value) {
            if (value.startsWith('[') && value.endsWith(']')) {
              data[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim());
            } else {
              data[key.trim()] = value.replace(/^['"]|['"]$/g, '');
            }
          }
        }
      }
      
      if (currentArray.length > 0) {
        data[currentKey] = currentArray;
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '无效的YAML格式' };
    }
  }

  detectFormat(content: string): DataFormat {
    const trimmed = content.trim();
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json';
    }
    
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
      return 'xml';
    }
    
    if (trimmed.includes(':') && trimmed.includes('\n') && !trimmed.includes(',')) {
      return 'yaml';
    }
    
    if (trimmed.includes('\n') && trimmed.split('\n')[0].includes(',')) {
      return 'csv';
    }
    
    if (trimmed.includes('# ') || trimmed.includes('## ') || trimmed.includes('```')) {
      return 'markdown';
    }
    
    return 'text';
  }

  importData(
    content: string,
    format?: DataFormat,
    customMappings?: Record<string, string>
  ): ImportResult {
    const detectedFormat = format || this.detectFormat(content);
    let parsedData: any;
    let parseResult: any;

    switch (detectedFormat) {
      case 'json':
        parseResult = this.parseJSON(content);
        break;
      case 'csv':
        parseResult = this.parseCSV(content);
        break;
      case 'markdown':
        parseResult = this.parseMarkdown(content);
        break;
      case 'xml':
        parseResult = this.parseXML(content);
        break;
      case 'yaml':
        parseResult = this.parseYAML(content);
        break;
      default:
        parseResult = { success: true, data: content };
    }

    if (!parseResult.success) {
      return {
        success: false,
        imported: 0,
        errors: [parseResult.error || 'Unknown error'],
        memories: []
      };
    }

    parsedData = parseResult.data;
    const memories: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'relatedIds'>[] = [];

    if (Array.isArray(parsedData)) {
      parsedData.forEach((item: any, index: number) => {
        const memory = this.createMemoryFromObject(item, detectedFormat, index, customMappings);
        if (memory) {
          memories.push(memory);
        }
      });
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      const memory = this.createMemoryFromObject(parsedData, detectedFormat, 0, customMappings);
      if (memory) {
        memories.push(memory);
      }
    } else {
      memories.push({
        content: String(parsedData),
        type: 'text',
        metadata: { dataFormat: detectedFormat }
      });
    }

    return {
      success: true,
      imported: memories.length,
      errors: [],
      memories
    };
  }

  private createMemoryFromObject(
    obj: any,
    format: DataFormat,
    index: number,
    customMappings?: Record<string, string>
  ): Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'relatedIds'> | null {
    const contentField = customMappings?.content || 
      obj.content || obj.text || obj.description || obj.body || 
      obj.title || JSON.stringify(obj);
    
    const typeField = customMappings?.type || 
      obj.type || obj.category || 'text';
    
    const tagsField = customMappings?.tags || 
      obj.tags || obj.labels || obj.categories || [];
    
    const moodField = customMappings?.mood || 
      obj.mood || obj.sentiment || 0.5;

    if (!contentField) {
      return null;
    }

    return {
      content: typeof contentField === 'string' ? contentField : JSON.stringify(contentField),
      type: this.normalizeType(typeField),
      metadata: {
        tags: Array.isArray(tagsField) ? tagsField : [tagsField],
        mood: typeof moodField === 'number' ? moodField : parseFloat(moodField) || 0.5,
        dataFormat: format,
        ...(obj.source && { source: obj.source }),
        ...(obj.date && { tags: [...(Array.isArray(tagsField) ? tagsField : [tagsField]), `imported-${new Date().toISOString().split('T')[0]}`] })
      }
    };
  }

  private normalizeType(type: string | unknown): Memory['type'] {
    if (typeof type !== 'string') return 'text';
    
    const lowerType = type.toLowerCase();
    
    if (['image', 'photo', 'picture'].includes(lowerType)) return 'image';
    if (['voice', 'audio', 'recording'].includes(lowerType)) return 'voice';
    if (['emotion', 'feeling', 'mood'].includes(lowerType)) return 'emotion';
    if (['task', 'todo', 'todo'].includes(lowerType)) return 'task';
    if (['link', 'url', 'uri'].includes(lowerType)) return 'link';
    if (['file', 'attachment', 'document'].includes(lowerType)) return 'file';
    
    return 'text';
  }
}

export const dataFormatParser = new DataFormatParser();
