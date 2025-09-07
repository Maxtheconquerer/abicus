import { supabase } from "./creds"

export async function uploadSources(contents, type, notebookId) {
	try {
		
		if (type === 'pdf') {

				const sourcesToInsert = contents.map(pdf => ({
				  name: pdf.name,
				  type: pdf.type,
				  notebook_id: pdf.notebook_id
				}));

				console.log('sourcesToInsert:', sourcesToInsert);
		  
				const { data, error } = await supabase
				  .from('sources')
				  .insert(sourcesToInsert);
		  
				if (error) {
				  throw error;
				}
		  
				return { success: true, data };
		} 
		
		if (type === 'website') {
			
			const sourcesToInsert = contents.map(pdf => ({
				name: pdf.name,
				type: pdf.type,
				notebook_id: notebookId
			  }));

			  console.log('sourcesToInsert:', sourcesToInsert);
		
			  const { data, error } = await supabase
				.from('sources')
				.insert(sourcesToInsert);
		
			  if (error) {
				throw error;
			  }
		
			  return { success: true, data };

		} 

		if (type === 'youtube') {

			const sourcesToInsert = contents.map(pdf => ({
				name: pdf.name,
				type: pdf.type,
				notebook_id: notebookId
			  }));

			  console.log('sourcesToInsert:', sourcesToInsert);
		
			  const { data, error } = await supabase
				.from('sources')
				.insert(sourcesToInsert);
		
			  if (error) {
				throw error;
			  }
		
			  return { success: true, data };

		} 

		
 	} catch (error) {
	  console.error(`Error updating to table:`, error);
	  return { data: null, error };
	}
  }


export async function retrieveSources( notebookId ) {

	const { data: notebooks, error } = await supabase
		.from('sources')
		.select('*')
		.eq('notebook_id', notebookId)
		
	if (error) throw error;

	return notebooks;

}