import type { BusOperator } from '@/types';

export const BUS_OPERATORS: BusOperator[] = [
  { id: 'selam', name: 'Selam Bus',     amh: 'ሰላም አውቶቡስ',  color: '#1E40AF', accent: '#FCD34D', tier: 'premium', rating: 4.7 },
  { id: 'odaa',  name: 'Odaa Transport', amh: 'ኦዳ ትራንስፖርት', color: '#15803D', accent: '#86EFAC', tier: 'premium', rating: 4.6 },
  { id: 'gadaa', name: 'Gadaa Bus',     amh: 'ገዳ አውቶቡስ',   color: '#9A3412', accent: '#FED7AA', tier: 'premium', rating: 4.5 },
  { id: 'sky',   name: 'Sky Bus',       amh: 'ስካይ አውቶቡስ',  color: '#0891B2', accent: '#67E8F9', tier: 'premium', rating: 4.5 },
  { id: 'ethio', name: 'Ethio Bus',     amh: 'ኢትዮ አውቶቡስ',  color: '#365314', accent: '#BEF264', tier: 'premium', rating: 4.4 },
  { id: 'walia', name: 'Walia Bus',     amh: 'ዋልያ አውቶቡስ',  color: '#7C2D12', accent: '#FED7AA', tier: 'mid',     rating: 4.2 },
  { id: 'lima',  name: 'Limalimo',      amh: 'ሊማሊሞ',        color: '#166534', accent: '#86EFAC', tier: 'premium', rating: 4.6 },
  { id: 'gold',  name: 'Golden Bus',    amh: 'ጎልደን አውቶቡስ', color: '#A16207', accent: '#FCD34D', tier: 'mid',     rating: 4.0 },
  { id: 'shgr',  name: 'Sheger Bus',    amh: 'ሸገር አውቶቡስ',  color: '#581C87', accent: '#D8B4FE', tier: 'mid',     rating: 4.1 },
  { id: 'haba',  name: 'Habesha',       amh: 'ሀበሻ አውቶቡስ',  color: '#9F1239', accent: '#FCA5A5', tier: 'mid',     rating: 4.3 },
];

export function getBusOperator(id: string): BusOperator | undefined {
  return BUS_OPERATORS.find(o => o.id === id);
}
