export type PokemonListItem = { name: string; url: string };
export type PokemonType = { slot: number; type: { name: string; url: string } };
export type Pokemon = {
id: number;
name: string;
sprites: { other?: { ['official-artwork']?: { front_default?: string } } };
types: PokemonType[];
height: number;
weight: number;
base_experience: number;
stats: { base_stat: number; stat: { name: string } }[];
};