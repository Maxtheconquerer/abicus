import { supabase } from "./creds"



export async function retrieveNotebooks() {
	const { data: notebooks, error } = await supabase
		.from('notebook_')
		.select('*')
		
	if (error) throw error;

	return notebooks;
}


export async function newNotebook(data) {
	
	const { data: notebooks, error } = await supabase
		.from('notebook_')
		.insert([{ 
			title: data.title,
			description: data.description,
			emoji: data.emoji,
		}
		])
		.select("id")
		
	if (error) throw error;

	return notebooks[0].id;
}