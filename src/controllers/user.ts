import { Request, Response, NextFunction } from "express";
import * as bcrypt from 'bcrypt';
import { getRepository } from "typeorm";
import { User } from '../entity/User';
import * as jwebtkn from 'jsonwebtoken';


export async function signup(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(User);
    const checkingPseudo = await repo.findOne({pseudo: req.body.pseudo}) || undefined;
    console.log(checkingPseudo);
    if(checkingPseudo) {
        return res.status(403).json({ message: 'Pseudo déjà utilisé'});
    }
    bcrypt.hash(req.body.password, 15)
        .then((hash:string) => {
            const user = new User();
            user.firstName =  Buffer.from(req.body.firstName, 'binary').toString('base64');
            user.lastName = Buffer.from(req.body.lastName, 'binary').toString('base64');
            user.pseudo = req.body.pseudo;
            user.password = hash;
            repo.save(user).then(() => res.status(201).json({message: 'Nouvel utilisateur enregistré ! '}))
                .catch(err => res.status(500).json({ 'Error': err }))
        })
        .catch(err => res.status(500).json({ 'Error': err }));
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const repo = getRepository(User);
    const user = await repo.findOne({pseudo: req.body.pseudo})
    if(user) {
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (valid) {
                return res.status(200).json({
                    pseudo: user.pseudo,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    id: user.id,
                    token: jwebtkn.sign(
                        {id: user.id},
                        'CRYPTAGEDUTOKEN2226080389',
                        { expiresIn: '24h'}
                    )
                });

            } else {
                return res.status(403).json({ message: 'Mot de passe invalide.'});
            }
        })
        .catch(err => res.status(500).json({ 'Error': err }));
                            
    } else {
        return res.status(404).json({message: 'Pseudo non valide !!'});
    }
};

export async function deleteUser(req: Request, res:Response, next: NextFunction) {
    const repo = getRepository(User);
    const user = await repo.findOne({id:req.params.id}).catch(error => console.log('aucun utilisateur trouvé avec cet id : ',error))
    if (user) {
        repo.remove(user)
            .then(() => res.status(200).json({message: 'Profil supprimé!!'}))
            .catch(err => res.status(500).json({message: err}));
    }
}
