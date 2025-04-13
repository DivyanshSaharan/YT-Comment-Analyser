from model import predict_sentiment_f
from pyspark.sql.functions import udf
from pyspark.sql.types import StructType, StructField, StringType, FloatType

def analyze_comments(comments, spark):
    """
    Function to analyze the sentiment of comments using Spark for parallelism.
    """
    # Create Spark DataFrame
    df = spark.createDataFrame(comments)

    # Define UDF for sentiment prediction
    def udf_predict(text):
        sentiment, score = predict_sentiment_f(text)
        return (sentiment, float(score))

    sentiment_schema = StructType([
        StructField("sentiment", StringType(), True),
        StructField("rating", FloatType(), True)
    ])

    predict_udf = udf(udf_predict, sentiment_schema)

    # Apply UDF to DataFrame
    result_df = df.withColumn("result", predict_udf(df["comment"]))

    # Flatten struct into separate columns
    result_df = result_df.withColumn("sentiment", result_df["result"]["sentiment"]) \
                         .withColumn("rating", result_df["result"]["rating"]) \
                         .drop("result")

    # Convert Spark DataFrame to list of dicts
    return result_df.toPandas().to_dict(orient="records")
