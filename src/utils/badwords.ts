/**
 * Normalizes a string by:
 * - lowercasing
 * - removing accents
 * - replacing common leet-speak substitutions
 * - removing non-alphanumeric characters
 */
export function normalizeLeet(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[4@]/g, 'a')
    .replace(/[8]/g, 'b')
    .replace(/[(<\[{]/g, 'c')
    .replace(/[3€]/g, 'e')
    .replace(/[6]/g, 'g')
    .replace(/[!1|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[9]/g, 'q')
    .replace(/[\$5]/g, 's')
    .replace(/[7\+]/g, 't')
    .replace(/[2]/g, 'z')
    .replace(/[^a-z]/g, '');
}

const RAW_BADWORDS: string[] = [
  // === PORTUGUÊS ===
  'puta', 'puto', 'putinha', 'putão', 'putao',
  'viado', 'viadinho', 'viada',
  'buceta', 'bct', 'bkta',
  'pau', 'pica', 'piroca', 'pirocao', 'pirocão',
  'cuzao', 'cuzão', 'cuzinho', 'cu',
  'merda', 'bosta', 'cagao', 'cagão', 'cagar',
  'foda', 'foder', 'fodase', 'fodido', 'fodida',
  'fuder', 'fuderoso',
  'caralho', 'caralhudo',
  'cacete', 'cacetao', 'cacetão',
  'porra', 'porrinha',
  'otario', 'otário', 'otaria',
  'idiota', 'imbecil', 'babaca', 'cretino',
  'retardado', 'mongoloide', 'mongol',
  'vagabundo', 'vagabunda',
  'safado', 'safada',
  'arrombado', 'arrombada',
  'biscate', 'rapariga',
  'prostituta', 'prostituto',
  'putaria',
  'sexo', 'sexual',
  'tesao', 'tesão',
  'gozar', 'gozo',
  'punheta', 'punheteiro',
  'siririca',
  'xoxota', 'xota',
  'rola', 'rolao', 'rolão',
  'desgraça', 'desgraca', 'desgracado',
  'lixo', 'escoria', 'escória',
  'nazista', 'nazi',
  'racista', 'racismo',
  'negro', 'negao', 'negão',
  'preto', 'pretinho',
  'judeu',
  'filho da puta', 'filhodaputa', 'fdp',
  'vai se foder', 'vsfoder', 'vsf',
  'vai tomar no cu', 'vtc',
  'minha rola', 'suck',
  'gordo', 'gordinha', 'gordão',
  'burro', 'burra',
  'boiola',
  'bicha',
  'traveco',
  'crack', 'cocaina', 'cocaína', 'maconha', 'droga', 'drogas',
  'terrorista', 'terror',
  'matar', 'morte', 'suicidio', 'suicídio',
  'estupro', 'estuprador',
  'pedofilo', 'pedófilo', 'pedofilia',
  // === ENGLISH ===
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
  'shit', 'shits', 'shitty', 'bullshit',
  'bitch', 'bitches', 'bitchy',
  'ass', 'asshole', 'asses',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks', 'cocksucker',
  'pussy', 'pussies',
  'whore', 'whores',
  'slut', 'sluts',
  'nigger', 'nigga', 'niggas',
  'faggot', 'fag', 'fags',
  'retard', 'retarded',
  'idiot', 'idiots',
  'moron', 'morons',
  'rape', 'rapist',
  'pedophile', 'pedophilia',
  'nazi', 'nazism',
  'racist', 'racism',
  'kill', 'killing', 'murder',
  'suicide',
  'porn', 'porno', 'pornography',
  'sex', 'sexy', 'sexual',
  'penis', 'vagina', 'anus',
  'boobs', 'boob', 'tits', 'tit',
  'cum', 'cumshot',
  'blowjob', 'handjob',
  'jerk', 'jackass',
  'dumbass', 'dumb',
  'motherfucker', 'mf',
  'wtf', 'stfu',
  'hell', 'damn', 'crap',
  'wank', 'wanker',
  'twat',
  'prick',
  'screw',
  'pervert', 'perv',
  'terrorist',
  'drug', 'cocaine', 'heroin', 'crack',
];

export const BADWORDS: string[] = RAW_BADWORDS.map(normalizeLeet);
