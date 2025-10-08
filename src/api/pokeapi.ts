import { cachedGet } from './axiosClient';
import { Pokemon, PokemonListItem } from '../types';


export async function fetchPokemonPage(offset = 0, limit = 100) {
return cachedGet<{ count: number; results: PokemonListItem[] }>(`/pokemon?offset=${offset}&limit=${limit}`);
}


export async function fetchPokemon(id: string | number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}


export async function fetchTypes() {
return cachedGet<{ results: { name: string; url: string }[] }>(`/type`);
}