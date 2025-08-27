export class User {
	private uid: string
	private name: string
	private email: string
	
	constructor(uid: string, name: string, email: string){
		if(uid == "") throw new Error("User UID is required!")

		this.uid = uid
		this.name = name
		this.email = email
	}
}