# StockTrading
本プロジェクトで、自動株式取引プログラムを作成する

# CONTRIBUTION
## Coding convention
This project is written in PHP so we need to have contribution rules in development team. Beside that the rules should be accepted widenly as an international standard to avoid controversy, ambiguous and ensure a high level of technical interoperability.

In the limitation we will agree about some convetions are recognized by the community and another specific rules.

#### International Standard Convention

- [RFC7231](https://tools.ietf.org/html/rfc7231#section-4.3) asserts about the semantics and content for Restful Web Service and related technologies such as AJAX so HTTP methods (GET, HEAD, POST, PUT, PATCH, DELETE) will be used in the suitable context.

- [RFC2616](https://tools.ietf.org/html/rfc2616#section-10) asserts about HTTP status codes and its meaning for suitable case as it should be.

- [PSR-2](http://www.php-fig.org/psr/psr-2/) and [PRS-4](http://www.php-fig.org/psr/psr-4/) are coding conventions for PHP Coding Standard which are approved widenly from PHP Community for several industrial frameworks so PHP Developers must comply strictly in software development process.

- [Object Oriented Programming](http://php.net/manual/en/language.oop5.php) and related concepts of Object Oriented Programming must be strictly apply to ensure about the `abstraction`, `encapsulation`, `polymorphism` and `inheritance` at least. A professional developer should understand clearly and apply it properly to ensure the structural, tightness, maintainable and adapt for enterprise application.

- [Laravel Framework](https://laravel.com) asserts that [we should follows PSR-2 and PSR-4](https://laravel.com/docs/5.4/contributions#coding-style) so it ONLY contains rules about PHPDoc. Anythings relate to Laravel Framework which does not comply to RFC or PSR-2/PSR-4 or OOP Concepts (if exist) will not be accepted.

#### Project Convention

- Commit message

Members in the team will review your commit messages - team activity so please describe your work shortly and meaningful.

For examples:
```
- Implement and test Rakuten API
- Update migration files for table `user`
```

Avoid ambiguous messages:
```
- Update
- Fix
```


- Hard coding

Constant string, table name, column name must be replaced by constant or translation (for html or json) to avoid [hard coding](https://en.wikipedia.org/wiki/Hard_coding) issue.

For examples:
```
const TEMPLATE_ID = 3;
const CREATED_AT = 'CreatedAt';
```

- Copyright header
```php
<?php
/**
 * Copyright (c) Project. All rights reserved.
 * -------------------------------------------------------------------------
 * NOTICE:  All information contained herein is, and remains
 * the property of Intelligent Business Solutions Vietnam and its suppliers,
 * if any. The intellectual and technical concepts contained
 * herein are proprietary to Intelligent Business Solutions Vietnam
 * and its suppliers and may be covered by Vietnamese Law,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Intelligent Business Solutions Vietnam.
 * -------------------------------------------------------------------------
 * Authors:
 *      Author1 <author.1@inte.co.jp>
 *      Author2 <author.2@inte.co.jp>
 */

```

- Class description

```php
namespace App\Core\Controller;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Abstract Controller
 * This controller is an example about abstract class
 * 
 * @category   \App\Core
 * @package    \App\Core\Controller
 * @author     Author1 <author.1@inte.co.jp>
 * @copyright  2017 Intelligent Business Solutions Vietnam
 * @version    1.0
 * @see        \Illuminate\Routing\Controller
 * @since      File available since Release 1.0
 */
abstract class Controller extends BaseController
{
   /**
    *  By default this controller uses a trait to
    *  provide this functionality without requiring any additional code.
    */
   use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
```
- Encapsulation in OOP
```php
/**
 * User hashed password
 *
 * @var string password
 */
private $password;

/**
 * Set password for user
 * Raw password will be hashed by bcrypt algorithm before saving to database
 *
 * @param string $email
 * @return User
 */
public function setPassword(string $rawPassword): User
{
   $this->password = Hash::make($rawPassword);
   return $this;
}

/**
 * Get user password in bcrypt format
 *
 * @return string
 */
public function getPassword(): string
{
   return $this->password;
}

```

#### Best Practices

Some features in PHP are highly NOT recommend in developing business feature because of explicitly and hard to maintain for enterprise application. If in case, you need to use please make your comment clear so other guys can follow it easier.

- Magic method in assignment

**Wrong**
```php
$a->thisPropertyDoesNotExist = 0;
```

**Right**
```
Declare property $thisPropertyDoesNotExist before using it
```
- Eval function

**Wrong**
```php
eval("$a + $b");
```

**Right**
```php
// This is an explaination about why we must use eval in here
// If you can not explain please DO NOT use
eval("$a + $b");
```
- Variable as a part of another variable or property name

**Wrong**
```php
echo $$a;
echo $this->$abc;
```

**Right**
```php
// This is an explaination about why we must use dynamic variable name
// If you can not explain please DO NOT use
echo $$a;

// This is an explaination about why we must use dynamic property name
// If you can not explain please DO NOT use
echo $this->$abc;
```
- Ternary operator

**Wrong**
```php
$example = trim($this->doSomething()) ? $this->doSomething() : "";
```
**Right**
```php
// ONLY use ternary in return statement of simple statement
$isSomethingNotEmpty = ! empty(trim($this->doSomething()));
return $isSomethingNotEmpty ? $this->doSomething() : "";
```
- Nested if else - complex conditions

**Wrong**
```php
if ($a) {
   if ($b) {
   }
} elseif ($c) {
} else {
}
```

**Right** (Early RETURN)
```php
if (($a) && ($b)) {
   return;
}

if ($c) {
   return;
}

return;
```

- `Else` keyword has no effect to return statement

**Wrong**
```php
if ($a) {
   return true;
} else {
   return false;
}
```

**Right** (No need ELSE because of RETURN)
```php
if ($a) {
   return true;
}

return false;
```

Because the cost for human readable and maintainace is expensive so please DO NOT abuse if you can do in a better way.

## Review Process and Pull Request

Review process will base on this commitment and wil be updated during development process if any exception.

Any point of view in discussion should compatible with International Coding Standard.

Repository controller will reject Pull Request (will be merged in to development where all developers will pull) if:

- Build result is fail (coverage by Travis CI and test cases)

Travis CI will fail in some cases relate to syntax error, fail test cases or migration process so 
in this case we need to make it pass before merging to make sure other developers can continue their work, things are tested and prevent risks when merging.

- Contributor can not explain what did they do.

In this case, we need to make things clear before merging because it is dangerous for other developers.

- Best practies are ignored

All developers should follow this agreement about best practices to ensure about unique coding style and maintainability.
