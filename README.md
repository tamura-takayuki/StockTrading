# StockTrading
本プロジェクトで、自動株式取引プログラムを作成する

----------------
# Wakasugi
Release - [http://54.65.12.229:8080](http://54.65.12.229:8080) [![Build Status](https://travis-ci.com/ibsvn/wakasugi.svg?token=zsCqafPta2pN9yYcs7ND&branch=release)](https://travis-ci.com/ibsvn/wakasugi)

Staging - [http://54.65.12.229:7070](http://54.65.12.229:7070) [![Build Status](https://travis-ci.com/ibsvn/wakasugi.svg?token=zsCqafPta2pN9yYcs7ND&branch=staging)](https://travis-ci.com/ibsvn/wakasugi)

### Getting started
#### Installation
- [Composer](https://getcomposer.org/) - Dependency management
- PHP 7 with Extensions (reference in [Dockerfile](Dockerfile))
- MySQL 5.6
- Python 2.7.10 (with pip and easy_install support)
#### Configuration
- Copy from [staging.env](staging.env) to [.env](.env)
- Modify suitable configuration for your local machine at [.env](.env)
#### Run application in the first time
```bash
$ easy_install mysql-python
$ composer update
$ php artisan serve
```

### Development
To make things standardization we need to have some working process, method and style
##### Management
- [Trello](https://trello.com) is our [Business Board](https://trello.com)
- Github Project is our [Technical Board ](https://github.com/ibsvn/wakasugi/projects/1)

##### Methodology
- [Agile - Scrum](https://www.cprime.com/resources/what-is-agile-what-is-scrum/) is standard methodology in software industry
- [Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development) is standard coding style
- [Integration Testing](https://en.wikipedia.org/wiki/Integration_testing) is standard testing for integration level
- [Unit Testing](https://en.wikipedia.org/wiki/Unit_testing) is standard testing for unit level

##### DevOps
- [Github](https://github.com) is our Git Server to mange source code
- [Travis CI](https://travis-ci.com) is our Testing and Deploy Server
- [AWS Container Registry](https://aws.amazon.com/ecr/) is registry for Docker images
- [AWS EC2](https://aws.amazon.com/ec2/) is staging and production server

##### Contribution
- [IBSVN Coding Convention](CONTRIBUTION.md)

Members in the team should be follow all things related to best practices other case will not be accepted.

### Instructions
Where I can add new testing data ?
- [x] Answer: You can add seed data for all tables in [here](database/seeds/tables) and all data will be affect to staging server at [http://52.68.57.173:8080](http://52.68.57.173:8080)

Where I can add new integration tests to verify business features ?
- [x] Answer: Integration tests use to verify request and response so it should be for `Controller`
so you can find it in [here](tests/unit/Http/Controllers)

When we want to make a migration, how can we do ?
- [x] Answer: Create new migration file in [migrations](database/migrations) or modify seeding data then
apply new migration and install sample data with `php artisan migrate:refresh --seed`

When I modify mysql schema  or seeding data in database, how can I generate corresponding source code ?
- [x] Answer: After  modify migration or seeding data please help to run migration and generate
new source code with command below
```
$ php artisan migrate:refresh --seed
$ python cmd/model.py
```

What is the lifecycle of development ?
- [x] Implement Integration Test to indentify your goals
- [x] Base on your goals and implement controller until you passed integration test
- [x] While implement action, you should write unit test to indentify function goals
- [x] Base on your function goals and implement function until you passed unit test
```
   Integration Test -> Controller Implementation [ Unit Test -> Function Implementation ]
```

