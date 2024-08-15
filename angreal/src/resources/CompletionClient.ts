interface CompletionClient {
    suggest(file: string, line: string, numberOfLines: number): Promise<string> 
    
    replace(file: string, originalCode: string, newCode: string): Promise<string> 
}

export default CompletionClient;