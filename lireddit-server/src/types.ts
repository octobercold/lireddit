import { IDatabaseDriver, EntityManager, Connection } from "@mikro-orm/core"

export type MyContext =  {
    em: EntityManager & EntityManager<IDatabaseDriver<Connection>>
}