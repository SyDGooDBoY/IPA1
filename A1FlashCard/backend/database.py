from sqlmodel import SQLModel, create_engine

DATABASE_URL = "mysql+pymysql://root:Whf87722377@localhost/flashcard_db"

engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
